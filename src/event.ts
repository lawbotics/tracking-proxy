import { BigQuery, BigQueryTimestamp } from '@google-cloud/bigquery';
import { NextFunction, Request, Response } from 'express';
import { Environment, EventType } from './config';
import { insertRows } from './writer';

interface Envelope {
  clientId?: string;
  uploadTime?: BigQueryTimestamp;
}

interface BaseEvent {
  id: number;
  eventType: string;
  userId: string;
  timestamp?: BigQueryTimestamp;
  sessionId?: number;
  userAgent?: string;
  email?: string;
  companyId?: string;
  companyName?: string;
  lawyerId?: string;
}

interface IdentifyEventProps {
  _type: EventType;
}

interface BehaviorEventProps {
  _type: EventType;
  product?: string;
  caseId?: string;  
  caseName?: string;
  eventProperties: string;
}

type IdentifyEvent = Envelope & BaseEvent & IdentifyEventProps;
type BehaviorEvent = Envelope & BaseEvent & BehaviorEventProps;
type TrackerEventProps = IdentifyEventProps | BehaviorEventProps;
export type TrackerEvent = IdentifyEvent | BehaviorEvent;

function cast<A>(a: unknown | any): A | undefined {
  try {
    return a as A;
  } catch (e) {
    return undefined;
  }
}

function numToTimestamp(num: number): BigQueryTimestamp | undefined {
  return num ? BigQuery.timestamp(new Date(num)) : undefined;
}

function unknownToTimestamp(num: unknown): BigQueryTimestamp | undefined {
  const validNum = cast<number>(num);
  if (validNum) {
    return numToTimestamp(validNum);
  }
  return new BigQueryTimestamp(new Date());
}

export const requestToEvents = (env: Environment) => async (req: Request, response: Response, next: NextFunction) => {
  if (req.method === 'POST') {
    const body = req.body;
    const envelopeProps: Envelope = {
      // backend events send API key instead of client ID (but they are the same)
      clientId: (body.client || body.api_key) as string,
      uploadTime: unknownToTimestamp(body.upload_time),
    };

    // backend events send the events in the 'events' field but it's sent in the 'e' field for frontend events
    const rawEvents = req.body.events || JSON.parse(req.body.e);
    const events: TrackerEvent[] = (rawEvents as Array<unknown>)
      .map((rawEvent) => {
        const rawEventObject = rawEvent as Record<string, unknown>;
        const eventProps = rawEventObject.event_properties as Record<string, unknown>;
        const baseProps = {
          id: rawEventObject.event_id as number || new Date().valueOf(),
          eventType: rawEventObject.event_type as string,
          userId: rawEventObject.user_id as string,
          timestamp: unknownToTimestamp(rawEventObject.timestamp),
          sessionId: cast<number>(rawEventObject.session_id),
          userAgent: cast<string>(rawEventObject.user_agent),
          companyId: cast<string>(eventProps.companyId),
          companyName: cast<string>(eventProps.companyName),
          email: cast<string>(eventProps.email),
          lawyerId: cast<string>(eventProps.lawyerId),
        };
        const trackerEventProps = resolveTrackerEventProps(rawEventObject);
        return {...envelopeProps, ...baseProps, ...trackerEventProps};
      });
    await insertRows(events, env);
  }
  next();
}

const resolveTrackerEventProps = (body: Record<string, unknown>): TrackerEventProps => {

  if (body.event_type === '$identify') {
    const user_props = body.user_properties as Record<string, unknown>;
    const sets = user_props.$set as Record<string, any>;
    return {
      _type: "identify",
    };
  }
  const event_props = body.event_properties as Record<string, unknown>;
  return {
    _type: "behavior",
    product: cast<string>(event_props.product),
    caseId: cast<string>(event_props.caseId),
    caseName: cast<string>(event_props.caseName),
    eventProperties: JSON.stringify(event_props),
  }
};


const randomInt = (min = Number.MIN_VALUE, max = Number.MAX_VALUE) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


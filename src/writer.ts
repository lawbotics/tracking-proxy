import { BigQuery } from "@google-cloud/bigquery";
import { TrackerEvent } from "./event";
import { dataset, Environment } from "../config/config";

type TrackerEventDao = Omit<TrackerEvent, "_type">;

export const insertRows = async (events: TrackerEvent[], env: Environment) => {
  const bigQuery = new BigQuery();
  const daoEvents = events
    .reduce<Record<string, TrackerEventDao[]>>((acc, curr) => {
      const prevEvents = acc[curr._type] || [];
      const { _type, ...rest } = curr;
      const daoEvent = rest;
      acc[curr._type] = [...prevEvents, daoEvent];
      return acc;
    }, {});
  for (const table of dataset.tables.filter((tb) => tb.environment === env)) {
    const eventsToInsert = daoEvents[table.eventType] || [];
    if (eventsToInsert.length > 0) {
      try {
        await bigQuery
          .dataset(dataset.id, { location: dataset.location })
          .table(table.id, { location: dataset.location })
          .insert(eventsToInsert);
      } catch (e) {
        console.warn(`Failed to insert ${eventsToInsert.length} into table ${table.id}`, JSON.stringify(e, null, 2));
      }
    }
  }
}

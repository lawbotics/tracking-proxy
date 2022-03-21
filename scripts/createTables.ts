import { BigQuery } from '@google-cloud/bigquery';
import { TrackerEvent } from '../src/event';
import { Table, dataset } from '../config/config';

const bigQuery = new BigQuery();

const createDataset = async (datasetId: string, location: string) => {
  const options = {
    location: location 
  }
  const [dataset] = await bigQuery.createDataset(datasetId, options);
  console.log(`Dataset with ID ${dataset.id} created`);
}

const createTable = async (datasetId: string, datasetLocation: string, table: Table) => {
  const options = {
    schema: table.schema,
    location: dataset.location,
  };

  const [tb] = await bigQuery
    .dataset(datasetId)
    .createTable(table.id, options);
  
  console.log(`Table with ID ${tb.id} created`);
}

const deleteDataset = async (datasetId: string) => {
  const [a] = await bigQuery.dataset(datasetId).delete({ force: true});
  console.log(`Deleted dataset ${datasetId}. Response: ${a}`);
}

const main = async () => {
  await deleteDataset(dataset.id);
  await createDataset(dataset.id, dataset.location);
  for (const table of dataset.tables) {
    await createTable(dataset.id, dataset.location, table);
  }
};

main();
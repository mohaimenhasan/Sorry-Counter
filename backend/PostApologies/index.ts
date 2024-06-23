import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

const account = process.env.CosmosDBAccountName;
const accountKey = process.env.CosmosDBAccountKey;
const tableName = "ApologiesTable";
const credential = new AzureNamedKeyCredential(account, accountKey);
const tableClient = new TableClient(`https://${account}.table.cosmos.azure.com`, tableName, credential);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log(`Http function processed request for url "${req.url}"`);
    context.log(`Request body: ${JSON.stringify(req.body)}`);
    const apology = req.body;
    const userId = apology["userId"];
    if (!userId) {
        context.res = {
            status: 400,
            body: "Please provide a userId in the request body."
        };
        return;
    }

    const additionalApologies = apology["count"] || 1;
    // Initialize apology count
    let apologyCount = 0;

    // Try to read existing apologies from Table Storage
    try {
        const entity: any = await tableClient.getEntity("User", userId);
        apologyCount = entity.count;
        context.log(`Existing apologies found for user ${userId}. Count is ${apologyCount}.`);
    } catch (error) {
        context.log(`No existing apologies found for user ${userId}, starting fresh.`);
    }

    // Update the apology count
    apologyCount += additionalApologies;

    const newEntity = {
        partitionKey: "User",
        rowKey: userId,
        count: apologyCount
    };

    context.log(`Updating apologies for user ${userId}. New count is ${apologyCount}.`);
    await tableClient.upsertEntity(newEntity);
    context.log(`Apology count updated successfully for user ${userId}. New count is ${apologyCount}.`);

    context.res = {
        status: 200,
        body: JSON.stringify({ userId, count: apologyCount })
    };
};

export default httpTrigger;
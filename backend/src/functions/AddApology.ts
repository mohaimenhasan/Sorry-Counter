import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

const account = process.env.CosmosDBAccountName;
const accountKey = process.env.CosmosDBAccountKey;
const tableName = "ApologiesTable";
const credential = new AzureNamedKeyCredential(account, accountKey);
const tableClient = new TableClient(`https://${account}.table.cosmos.azure.com`, tableName, credential);

export async function AddApology(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const apology: any = await request.json();
    const userId = apology.userId;
    const additionalApologies = apology.count || 1;

    // Initialize apology count
    let apologyCount = 0;

    // Try to read existing apologies from Table Storage
    try {
        const entity: any = await tableClient.getEntity("User", userId);
        apologyCount = entity.count;
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

    await tableClient.upsertEntity(newEntity);

    return { body: `Apology count updated successfully for user ${userId}. New count is ${apologyCount}.` };
};

app.http('AddApology', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: AddApology
});

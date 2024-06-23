import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

const account = process.env.CosmosDBAccountName;
const accountKey = process.env.CosmosDBAccountKey;
const tableName = "ApologiesTable";
const credential = new AzureNamedKeyCredential(account, accountKey);
const tableClient = new TableClient(`https://${account}.table.cosmos.azure.com`, tableName, credential);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {    context.log(`Http function processed request for url "${req.url}"`);
    context.log(`Http function processed request for url "${req.url}"`);
    const userId = req.query.userId;
    if (!userId) {
        context.res = {
            status: 400,
            body: "Please provide a userId in the query string."
        };
        return;
    }

    try {
        // Check if the user exists
        await tableClient.getEntity("User", userId);
        
        // If the user exists, proceed to delete
        await tableClient.deleteEntity("User", userId);
        context.log(`Apology for user ${userId} deleted successfully.`);
        context.res = {
            status: 200,
            body: `Apology for user ${userId} deleted successfully.`
        };
    } catch (error) {
        if (error.statusCode === 404) {
            // User does not exist
            context.log(`User ${userId} not found.`);
            context.res = {
                status: 400,
                body: `User ${userId} not found.`
            };
        } else {
            // Other errors
            context.log(`Error deleting apology for user ${userId}: ${error.message}`);
            context.res = {
                status: 500,
                body: `Error deleting apology for user ${userId}: ${error.message}`
            };
        }
    }
};

export default httpTrigger;
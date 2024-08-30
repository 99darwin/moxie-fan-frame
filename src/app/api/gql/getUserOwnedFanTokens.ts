import { gql } from "graphql-request";
import { GraphQLClient } from "graphql-request";

export const graphQLClient = new GraphQLClient(
  "https://api.studio.thegraph.com/query/23537/moxie_protocol_stats_mainnet/version/latest"
);

export const getUserOwnedFanTokens = async (address: string): Promise<any> => {
    const query = gql`
    query MyQuery($userAddresses: [ID!]) {
        users(where: { id_in: $userAddresses }) {
          portfolio {
            balance
            buyVolume
            sellVolume
            subjectToken {
              name
              symbol
            }
          }
        }
      }
    `;

    const variable = {
        userAddresses: [address],
    };

    try {
        const data = await graphQLClient.request(query, variable);
        return data;
    } catch (e: any) {
        console.error("GraphQL request error:", e.message);
        return null;
    }
}
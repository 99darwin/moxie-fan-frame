import { gql } from "graphql-request";
import { GraphQLClient } from "graphql-request";

const graphQLClient = new GraphQLClient(
    "https://api.studio.thegraph.com/query/23537/moxie_vesting_mainnet/version/latest"
  );

export const getVestingContractAddress = async (address: string): Promise<any> => {
    
    const query = gql`
        query MyQuery($beneficiary: Bytes) {
            tokenLockWallets(where: {beneficiary: $beneficiary}) {
                address: id
            }
        }
    `;

    const variable = {
        beneficiary: address
    };

    try {
        const data = await graphQLClient.request(query, variable);
        return data;
      } catch (e: any) {
        console.error("GraphQL request error:", e.message);
        return null;
      }
};
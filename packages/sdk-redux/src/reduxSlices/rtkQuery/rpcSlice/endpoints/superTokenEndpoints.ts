import {getFramework, getSigner} from '../../../../sdkReduxConfig';
import {TransactionInfo} from '../../../argTypes';
import {registerNewTransaction} from '../../../transactionSlice/registerNewTransaction';
import {getMostSpecificTokenTag} from '../../cacheTags/tokenTags';
import {RpcEndpointBuilder} from '../rpcEndpointBuilder';

import {
    SuperTokenDowngradeMutation,
    SuperTokenTransferMutation,
    SuperTokenUpgradeAllowanceQuery,
    SuperTokenUpgradeMutation,
} from './superTokenArgs';

export const createSuperTokenEndpoints = (builder: RpcEndpointBuilder) => ({
    superTokenUpgrade: builder.mutation<TransactionInfo, SuperTokenUpgradeMutation>({
        queryFn: async (arg, queryApi) => {
            const signer = await getSigner(arg.chainId);
            const framework = await getFramework(arg.chainId);
            const superToken = await framework.loadSuperToken(arg.superTokenAddress);

            const upgradeToSuperTokenTransactionResponse = await superToken
                .upgrade({
                    amount: arg.amountWei,
                })
                .exec(signer);

            await registerNewTransaction(
                arg.chainId,
                upgradeToSuperTokenTransactionResponse.hash,
                !!arg.waitForConfirmation,
                queryApi.dispatch,
                {
                    endpoint: queryApi.endpoint,
                    arg: arg,
                }
            );

            return {
                data: {
                    hash: upgradeToSuperTokenTransactionResponse.hash,
                    chainId: arg.chainId,
                },
            };
        },
    }),
    superTokenUpgradeAllowance: builder.query<string, SuperTokenUpgradeAllowanceQuery>({
        queryFn: async (arg) => {
            const framework = await getFramework(arg.chainId);
            const superToken = await framework.loadSuperToken(arg.superTokenAddress);

            return {
                data: await superToken.underlyingToken.allowance({
                    providerOrSigner: framework.settings.provider,
                    owner: arg.accountAddress,
                    spender: superToken.address,
                }),
            };
        },
        providesTags: (_result, _error, arg) => [
            getMostSpecificTokenTag({
                chainId: arg.chainId,
                address1: arg.superTokenAddress,
                address2: arg.accountAddress,
                address3: undefined,
            }),
        ],
    }),
    superTokenDowngrade: builder.mutation<TransactionInfo, SuperTokenDowngradeMutation>({
        queryFn: async (arg, queryApi) => {
            const signer = await getSigner(arg.chainId);
            const framework = await getFramework(arg.chainId);
            const superToken = await framework.loadSuperToken(arg.superTokenAddress);

            const transactionResponse = await superToken
                .downgrade({
                    amount: arg.amountWei,
                })
                .exec(signer);

            await registerNewTransaction(
                arg.chainId,
                transactionResponse.hash,
                !!arg.waitForConfirmation,
                queryApi.dispatch,
                {
                    endpoint: queryApi.endpoint,
                    arg: arg,
                }
            );

            return {
                data: {
                    hash: transactionResponse.hash,
                    chainId: arg.chainId,
                },
            };
        },
    }),
    superTokenTransfer: builder.mutation<TransactionInfo, SuperTokenTransferMutation>({
        queryFn: async (arg, queryApi) => {
            const signer = await getSigner(arg.chainId);
            const framework = await getFramework(arg.chainId);
            const superToken = await framework.loadSuperToken(arg.superTokenAddress);

            const transactionResponse = await superToken
                .transfer({
                    amount: arg.amountWei,
                    receiver: arg.receiverAddress,
                })
                .exec(signer);

            await registerNewTransaction(
                arg.chainId,
                transactionResponse.hash,
                !!arg.waitForConfirmation,
                queryApi.dispatch,
                {
                    endpoint: queryApi.endpoint,
                    arg: arg,
                }
            );

            return {
                data: {
                    hash: transactionResponse.hash,
                    chainId: arg.chainId,
                },
            };
        },
    }),
});
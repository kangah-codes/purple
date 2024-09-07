import { GenericAPIResponse, Session } from "@/@types/request";
import { useMutation, UseMutationResult } from "react-query";

export const useLogin = ({
	loginInformation,
}: {
	loginInformation: {
		username: string;
        password: string;
	};
}): UseMutationResult<GenericAPIResponse<Session>, Error> => {
	return useMutation(["login"], async () => {
		const res = await fetch(
			`${process.env.API_URL}/auth/login`,
			{
				method: "POST",
				headers: {
					"x-api-key": process.env.API_KEY as string,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(loginInformation),
			}
		);

		if (!res.ok) {
            const errorResponse = await res.json();
            throw new Error(errorResponse.message || 'Login failed');
        }

        const json = await res.json();
        return json;
	});
};

// export const useInvoices = ({
// 	sessionData,
// 	options,
// 	requestParams,
// 	id,
// }: {
// 	sessionData: APISession;
// 	options?: UseQueryOptions;
// 	requestParams?: RequestParamQuery;
// 	id?: string;
// }): UseQueryResult<GenericAPIResponse<Invoice>, Error> => {
// 	return useQuery(
// 		["invoices", requestParams],
// 		async () => {
// 			const res = await fetch(
// 				id
// 					? `${process.env.NEXT_PUBLIC_API_URL}/company/invoices/${id}`
// 					: `${
// 							process.env.NEXT_PUBLIC_API_URL
// 						}/company/invoices?${QueryString.stringify(
// 							requestParams
// 						)}`,
// 				{
// 					method: "GET",
// 					headers: {
// 						domain: sessionData.domain,
// 						"Api-Key": process.env.NEXT_PUBLIC_API_KEY as string,
// 						Authorization: sessionData.Authorization,
// 						"Content-Type": "application/json",
// 					},
// 				}
// 			);

// 			if (!res.ok) {
// 				throw new Error(`${res.status}`);
// 			}

// 			return res.json();
// 		},
// 		{
// 			...(options as Omit<
// 				UseQueryOptions<any, any, any, any>,
// 				"queryKey" | "queryFn" | "initialData"
// 			>),
// 		}
// 	);
// };
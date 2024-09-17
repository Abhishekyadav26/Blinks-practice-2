import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from "@solana/actions"
import { clusterApiUrl, ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

export const GET = (req: Request) => {

    const payload : ActionGetResponse = {
        icon: new URL("https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Solana_logo.png/252px-Solana_logo.png",new URL(req.url).origin).toString(),
        label: "Send Memo",
        description: "Super simple Action",
        title: "Memo Demo",
    };

    return Response.json(payload,{
        headers: ACTIONS_CORS_HEADERS
    });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    const body: ActionPostRequest = await req.json();
    let account: PublicKey;
    try {
        account = new PublicKey(body.account);
    } catch (err) {
        return new Response('Invalid "account" provided',{
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }

    try{
        const transaction = new Transaction()
        transaction.add(

            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1000,
            }),

            new TransactionInstruction({
                programId: new PublicKey(MEMO_PROGRAM_ID),
                data: Buffer.from('this is a simple memo message',"utf8"),
                keys: [],
            }),
        );

        const connection = new Connection(clusterApiUrl("devnet"));
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
            },
            
        })

        return Response.json(payload, {headers: ACTIONS_CORS_HEADERS})

        transaction.feePayer = account;
    } catch(err){
        return Response.json("An unknown error occured",{status: 400})
    }
}
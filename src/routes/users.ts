import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from '../database'
import { z } from "zod";

export async function usersRoutes(app: FastifyInstance){

    app.post('/',
    async (request,reply) => {
      
        const createUserBody = z.object({
            name:z.string(),
            email:z.string()
        })

        const { name,email } = createUserBody.parse(request.body)

       
        let sessionId = request.cookies.sessionId

        if(!sessionId){
            sessionId = randomUUID()

            reply.cookie('sessionId',sessionId,{
                path:'/',
                maxAge:60 * 60 * 24 * 7
            })

        }

        await knex('users').insert({
            id:randomUUID(),
            session_id:sessionId,
            name,
            email
        })

        return reply.status(201).send()
        
      
    })


    app.get('/',async (request,reply) => {


        const users = await knex.select('*').from('users')

        return reply.status(201).send(users)
    })
}
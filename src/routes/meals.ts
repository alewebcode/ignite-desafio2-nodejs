import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { randomUUID } from "crypto";

export async function mealsRoutes(app:FastifyInstance) {

    app.post('/',{
        preHandler:[checkSessionIdExists]
    }, async(request,reply) => {
        
        const createBodyMeals = z.object({
            name:z.string(),
            description:z.string(),
            date:z.coerce.date(),
            diet:z.boolean(),
            //user_id:z.string()
        })

        const {name,description,diet,date} = createBodyMeals.parse(request.body)
        
        const sessionId = request.cookies.sessionId

        const user = await knex('users').where({
            session_id:sessionId
        }).first()

        
 
            await knex('meals').insert({
                id:randomUUID(),
                name,
                description,
                date:date.getTime(),
                diet,
                user_id:user?.id
    
            })
       

        return reply.status(201).send()
        
    })

    app.put('/:id',{ 
        preHandler:[checkSessionIdExists]
    },
    async (request,reply) => {

        const typeParams = z.object({
            id:z.string().uuid()
        })

      

        const { id }  = typeParams.parse(request.params)

        const sessionId = request.cookies.sessionId

        const user = await knex('users').where({
            session_id:sessionId,
        }).first()

       
        if(!user){
            return reply.status(401).send({
                error:'Unauthorized'
            })
        }

        const data = request.body

        await knex('meals').update(data).where({
            id
        })

        return reply.status(201).send()

    })


    app.get('/',{
        preHandler:[checkSessionIdExists]
    },
    async (request,reply) => {

        const sessionId = request.cookies.sessionId

        const user = await knex('users').where({
            session_id:sessionId
        }).first()

        
        if(!user){
            return reply.status(401).send({
                error:'Unauthorized'
            })
        }

        const meals_user = await knex('meals').where({
            user_id:user.id
        }).select('*')

        return reply.status(201).send(meals_user)

       
    })

    app.get('/:id',{
        preHandler:[checkSessionIdExists]
    },
    async (request,reply) => {

         const typeParams = z.object({
            id:z.string().uuid()
        })

        const { id }  = typeParams.parse(request.params)

        const sessionId = request.cookies.sessionId
        
        const user = await knex('users').where({
            session_id:sessionId,
        }).first()

       
        if(!user){
            return reply.status(401).send({
                error:'Unauthorized'
            })
        }


        const meal = await knex('meals').where({
            id
        }).select('*')

        return reply.status(201).send(meal)

       
       
    })
    app.delete('/:id',{
        preHandler:[checkSessionIdExists]
    },
    async (request,reply) => {

         const typeParams = z.object({
            id:z.string().uuid()
        })

      
        const { id }  = typeParams.parse(request.params)

        const sessionId = request.cookies.sessionId

        const user = await knex('users').where({
            session_id:sessionId,
        }).first()

       
        if(!user){
            return reply.status(401).send({
                error:'Unauthorized'
            })
        }

        await knex('meals')
        .delete()
        .where({
            id
        })

        return reply.status(201).send()

       
       
    })
    app.get('/metrics',{
        preHandler:[checkSessionIdExists]
    },
    async (request,reply) => {

        const sessionId = request.cookies.sessionId

        const user = await knex('users').where({
            session_id:sessionId
        }).first()

        if(!user){
            return reply.status(401).send({
                error:'Unauthorized'
            })
        }

        const total_meals = await knex('meals').where({
            user_id:user.id
        })
        
        const total_on_diet = await knex('meals').count('id',{as:'total'}).where({
            user_id:user.id,
            diet:true
        }).first()

        const total_out_diet = await knex('meals').count('id',{as:'total'}).where({
            user_id:user.id,
            diet:false
        }).first()

        const { bestOnDietSequence } = total_meals.reduce(
            (acc, meal) => {
              if (meal.diet) {
                acc.currentSequence += 1
              } else {
                acc.currentSequence = 0
              }
    
              if (acc.currentSequence > acc.bestOnDietSequence) {
                acc.bestOnDietSequence = acc.currentSequence
              }
    
              return acc
            },
            { bestOnDietSequence: 0, currentSequence: 0 },
        )

 

        return reply.send({
            totalMeals:total_meals.length,
            totalMealsOnDiet:total_on_diet?.total,
            totalMealsOffDiet:total_out_diet?.total,
            bestOnDietSequence
        })

       
       
    })


}
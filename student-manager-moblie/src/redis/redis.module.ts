import { Module } from "@nestjs/common"
import { createClient } from "redis"

const createRedisClient = async () => {
  return await createClient({
    socket: {
      host: 'localhost',
      port: 6379
    }
  }).connect()
}

@Module({
  providers: [
    {
      provide: 'NEST_REDIS',
      useFactory: createRedisClient
    }
  ],
  exports: ['NEST_REDIS'],
})

export class RedisModule {}

#!/usr/bin/env ts-node

import { Metric, MetricsHandler } from '../src/metrics'
import { User, UserHandler } from '../src/user'

const users = [
  new User('Louis', 'louis.deveze@edu.ece.fr' , 'Framboise', false),
  new User('Maxime','maxime.tran@edu.ece.fr' , 'Litchi', false),
]

const met1 = [
  new Metric(`${new Date('2013-11-01 14:00 UTC').getTime()}`, 12),
  new Metric(`${new Date('2013-11-01 14:15 UTC').getTime()}`, 10),
  new Metric(`${new Date('2013-11-01 14:30 UTC').getTime()}`, 8),
  new Metric(`${new Date('2013-11-01 14:45 UTC').getTime()}`, 23),
  new Metric(`${new Date('2013-11-01 15:30 UTC').getTime()}`, 25),
  new Metric(`${new Date('2013-11-01 15:15 UTC').getTime()}`, 19),
  new Metric(`${new Date('2013-11-01 15:45 UTC').getTime()}`, 17)
]

const met2 = [
  new Metric(`${new Date('2013-11-01 14:00 UTC').getTime()}`, 67),
  new Metric(`${new Date('2013-11-01 14:15 UTC').getTime()}`, 64),
  new Metric(`${new Date('2013-11-01 14:30 UTC').getTime()}`, 58),
  new Metric(`${new Date('2013-11-01 14:45 UTC').getTime()}`, 48),
  new Metric(`${new Date('2013-11-01 15:15 UTC').getTime()}`, 73),
  new Metric(`${new Date('2013-11-01 15:40 UTC').getTime()}`, 65),
  new Metric(`${new Date('2013-11-01 17:15 UTC').getTime()}`, 59),
  new Metric(`${new Date('2019-01-01 16:30 UTC').getTime()}`, 47)
]

const dbUser = new UserHandler('./db/users')
const dbMetrics = new MetricsHandler('./db/metrics')

dbUser.saveMany(users, (err: Error | null) => {
    if (err) throw err
    console.log('Users were added to the Database')
})

dbMetrics.saveMany("Louis", met1, (err: Error | null) => {
  if (err) throw err
  console.log('Metrics of Maxime were added to the Database')
})


dbMetrics.saveMany("Maxime", met2, (err: Error | null) => {
  if (err) throw err
  console.log('Metrics of Louis were added to the Database')
})

dbUser.close();
dbMetrics.close();
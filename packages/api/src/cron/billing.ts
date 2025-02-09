import { and, eq, gt, sql, sum } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

import { CloudflareEnvBindings } from '../lib/middlewares';
import { subDays, startOfDay } from 'date-fns';
import { pullFundsFromPrivyServerWallet } from '../lib/privy';
import { ETH_TO_GWEI, getWalletEthBalance } from '../lib/eth';

export async function runNightlyBillingCron(scheduledTime: Date, env: CloudflareEnvBindings) {
  // should get called with scheuduledTime being midnight
  const yesterdayDate = startOfDay(subDays(scheduledTime, 1)).toISOString().substring(0, 10);
  const db = drizzle(env.DB, { schema });

  // TODO: move this work into a queue

  const projects = await db.query.projectsTable.findMany();
  for (const project of projects) {
    const result = await db
      .select({
        cost: sum(sql`costDetails->'ethGwei'`).mapWith(Number),
      })
      .from(schema.requestsTable)
      .where(
        and(eq(schema.requestsTable.projectId, project.id), gt(sql`timestamp`, yesterdayDate))
      );
    const usage = result[0];
    console.log(usage);

    const costEthGwei = usage.cost;
    console.log('total cost is ', costEthGwei / ETH_TO_GWEI);
    console.log(await getWalletEthBalance(project.id));

    const txn = await pullFundsFromPrivyServerWallet(project.privyServerWalletId, costEthGwei);

    console.log(txn);
    // TODO: record transaction details in another table to display in a billing page
    // maybe send an email if the user has one on file?
  }
}

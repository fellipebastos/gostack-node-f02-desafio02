import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const inital = { income: 0, outcome: 0, total: 0 };

    const transactions = await this.find();

    const balance = transactions.reduce((acumulator, transaction) => {
      const prevAcc = acumulator;
      const { type, value } = transaction;

      prevAcc[type] += value;

      return prevAcc;
    }, inital);

    balance.total = balance.income - balance.outcome;

    return balance;
  }

  public async findWithCategory(): Promise<Transaction[]> {
    const transactions = await this.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .getMany();

    return transactions;
  }
}

export default TransactionsRepository;

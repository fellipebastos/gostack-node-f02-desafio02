import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import transactionsRouter from '../routes/transactions.routes';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance();

      if (total < value) {
        throw new AppError('Insufficient funds.');
      }
    }

    const categoryRepository = getRepository(Category);

    let foundCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!foundCategory) {
      const newCategory = categoryRepository.create({ title: category });

      await categoryRepository.save(newCategory);
      foundCategory = newCategory;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: foundCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

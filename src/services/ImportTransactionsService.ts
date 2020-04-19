import fs from 'fs';
import path from 'path';
import csvParse from 'csvtojson';
import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';

import CreateTransactionService from './CreateTransactionService';

import Transaction from '../models/Transaction';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.storageFolder, filename);
    const csvFileExists = fs.promises.stat(csvFilePath);

    if (!csvFileExists) {
      throw new AppError('Upload failed.');
    }

    const transactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();

    const transactionsToInsert = await csvParse().fromFile(csvFilePath);

    const lastTransaction = await transactionsToInsert.reduce(
      async (accumulator, transaction) => {
        const createdTransaction = await accumulator;

        if (createdTransaction instanceof Transaction) {
          transactions.push(createdTransaction);
        }

        return createTransaction.execute(transaction);
      },
      Promise.resolve(),
    );

    transactions.push(lastTransaction);

    await fs.promises.unlink(csvFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;

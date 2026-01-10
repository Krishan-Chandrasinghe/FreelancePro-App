import { Request, Response } from "express";
import Expense from "../models/Expense";

const createExpense = async (req: any, res: Response) => {
  const { title, amount, category, date, description, receipt } = req.body;

  const expense = await Expense.create({
    user: req.user._id,
    title,
    amount,
    category,
    date,
    description,
    receipt,
  });

  res.status(201).json(expense);
};

const getExpenses = async (req: any, res: Response) => {
  const expenses = await Expense.find({ user: req.user._id }).sort({
    date: -1,
  });
  res.json(expenses);
};

const deleteExpense = async (req: any, res: Response) => {
  const expense = await Expense.findById(req.params.id);

  if (expense && expense.user.toString() === req.user._id.toString()) {
    await expense.deleteOne();
    res.json({ message: "Expense removed" });
  } else {
    res.status(404).json({ message: "Expense not found" });
  }
};

const updateExpense = async (req: any, res: Response) => {
  const expense = await Expense.findById(req.params.id);

  if (expense && expense.user.toString() === req.user._id.toString()) {
    const { title, amount, category, date, description, receipt } = req.body;

    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.description = description || expense.description;
    expense.receipt = receipt || expense.receipt;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } else {
    res.status(404).json({ message: "Expense not found" });
  }
};

export { createExpense, getExpenses, updateExpense, deleteExpense };

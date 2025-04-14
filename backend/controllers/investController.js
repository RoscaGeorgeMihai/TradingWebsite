const Users = require('../models/Users');
const Transaction = require('../models/Transaction');

exports.getInvestmentProfile = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizator negăsit' });
        }

        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(10);

        res.json({
            profile: {
                totalBalance: user.totalBalance,
                availableFunds: user.availableFunds,
                investedAmount: user.investedAmount
            },
            transactions: transactions.map(transaction => ({
                id: transaction._id,
                type: transaction.type,
                amount: transaction.type === 'Withdrawal' || transaction.type === 'Investment' 
                    ? -Math.abs(transaction.amount) 
                    : transaction.amount,
                date: transaction.date.toISOString().split('T')[0],
                status: transaction.status
            }))
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare de server');
    }
};

exports.depositFunds = async (req, res) => {
    const { amount, cardNumber, cardHolder, expiryDate, cvv } = req.body;
    
    if (!amount || !cardNumber || !cardHolder || !expiryDate || !cvv) {
        return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });
    }
    
    try {
        const depositAmount = parseFloat(amount);
        
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ message: 'Suma trebuie să fie un număr pozitiv' });
        }

        const user = await Users.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizator negăsit' });
        }
        
        user.totalBalance += depositAmount;
        user.availableFunds += depositAmount;
        await user.save();

        const transaction = new Transaction({
            userId: req.user.id,
            type: 'Deposit',
            amount: depositAmount,
            status: 'Completed'
        });
        
        await transaction.save();

        res.json({
            message: 'Depozit efectuat cu succes',
            profile: {
                totalBalance: user.totalBalance,
                availableFunds: user.availableFunds,
                investedAmount: user.investedAmount
            },
            transaction: {
                id: transaction._id,
                type: transaction.type,
                amount: transaction.amount,
                date: transaction.date.toISOString().split('T')[0],
                status: transaction.status
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare de server');
    }
};

exports.withdrawFunds = async (req, res) => {
    const { amount, iban } = req.body;
    
    if (!amount || !iban) {
        return res.status(400).json({ message: 'Suma și IBAN-ul sunt obligatorii' });
    }
    
    try {
        const withdrawAmount = parseFloat(amount);
        
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            return res.status(400).json({ message: 'Suma trebuie să fie un număr pozitiv' });
        }
        
        const user = await Users.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizator negăsit' });
        }
        
        if (user.availableFunds < withdrawAmount) {
            return res.status(400).json({ message: 'Fonduri insuficiente pentru retragere' });
        }
        
        user.totalBalance -= withdrawAmount;
        user.availableFunds -= withdrawAmount;
        await user.save();
        
        const transaction = new Transaction({
            userId: req.user.id,
            type: 'Withdrawal',
            amount: withdrawAmount,
            status: 'Completed'
        });
        
        await transaction.save();
        
        res.json({
            message: 'Retragere efectuată cu succes',
            profile: {
                totalBalance: user.totalBalance,
                availableFunds: user.availableFunds,
                investedAmount: user.investedAmount
            },
            transaction: {
                id: transaction._id,
                type: transaction.type,
                amount: -withdrawAmount, 
                date: transaction.date.toISOString().split('T')[0],
                status: transaction.status
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare de server');
    }
};
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: String,
  number: Number,
});

const winnerSchema = new mongoose.Schema({
  spin: Number,
  winnerNumber: Number,
});

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  players: [playerSchema],
  winners: [winnerSchema],
}, { timestamps: true });

export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

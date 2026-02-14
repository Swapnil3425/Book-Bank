require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

async function run() {
  await connectDB();

  const students = await User.find({ role: 'student' }).sort({ _id: 1 });
  console.log(`Found ${students.length} student(s).`);

  for (const user of students) {
    try {
      const cur = (user.institutionalId || '').toString();
      // extract digits from current id
      const digits = cur.replace(/\D/g, '');
      const last4 = digits.slice(-4).padStart(4, '0');
      const base = `11231${last4}`; // e.g. 11231 + last4

      let candidate = base;
      let suffix = 0;

      // ensure uniqueness (skip the current user)
      while (true) {
        const clash = await User.findOne({ institutionalId: candidate, _id: { $ne: user._id } });
        if (!clash) break;
        suffix += 1;
        candidate = base + String(suffix).padStart(2, '0');
        // As a fallback, after many tries, append a timestamp
        if (suffix > 99) {
          candidate = base + Date.now().toString().slice(-6);
          break;
        }
      }

      if (user.institutionalId !== candidate) {
        const old = user.institutionalId;
        user.institutionalId = candidate;
        await user.save();
        console.log(`Updated user ${user._id} (${user.name}): ${old} -> ${candidate}`);
      } else {
        console.log(`No change for ${user._id} (${user.name}): already ${candidate}`);
      }
    } catch (err) {
      console.error(`Failed to update user ${user._id}:`, err.message);
    }
  }

  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

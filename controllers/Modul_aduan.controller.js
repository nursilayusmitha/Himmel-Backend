const Aduan = require('../models/Modul_aduan.model');
const UserEksternal = require('../models/userEksternalModels');

const mongoose = require('mongoose');

const DUMMY_USER_ID = new mongoose.Types.ObjectId("64dffd9f9ee78b9a0d000000"); // ID unik dan tidak mungkin tergenerate otomatis


// Create Aduan
exports.createAduan = async (req, res) => {
  const {
    userId,
    aduan,
    nama,
    noTelp,
    email,
    priority,
    description
  } = req.body;

  try {
    const newAduan = await Aduan.create({
      userId: userId || DUMMY_USER_ID,
      aduan,
      nama,
      noTelp,
      email,
      priority,
      description
    });
    res.status(201).json(newAduan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Create Percakapan
exports.createPercakapan = async (req, res) => {
  const { aduanId, sender, senderType, message } = req.body;
  try {
    const aduan = await Aduan.findById(aduanId);
    if (!aduan) return res.status(404).json({ message: "Aduan not found" });

    aduan.percakapan.push({
      sender: sender || DUMMY_USER_ID,
      senderType,
      message
    });
    await aduan.save();

    res.json(aduan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Aduan
exports.getAllAduan = async (req, res) => {
  try {
    const aduans = await Aduan.find()
      .sort({ createdAt: -1 }) // Urutkan terbaru dulu
      .populate('userId', 'userName imageName') // bisa jadi null jika user tidak ditemukan
      .populate('modul_pic', 'userName');

    const result = aduans.map((a) => {
      const unreadCount = a.percakapan.filter(p =>
        p.senderType === "userEksternal" && p.seen === false
      ).length;

      // Atur default jika userId null
      const user = a.userId || {
        _id: DUMMY_USER_ID,
        userName: 'Unknown',
        imageName: 'Unknown',
      };

      return {
        ...a.toObject(),
        userId: user, // override userId dengan hasil populate atau default dummy
        unreadCount,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Get Aduan by Status
exports.getAduanByStatus = async (req, res) => {
  try {
    const status = req.params.status;

    const aduans = await Aduan.find({ status })
      .sort({ createdAt: -1 }) // Urutkan terbaru dulu
      .populate('userId', 'userName imageName')
      .populate('modul_pic', 'userName');

    const result = aduans.map((a) => {
      const unreadCount = a.percakapan.filter(p =>
        p.senderType === "userEksternal" && p.seen === false
      ).length;

      // Handle userId null → fallback ke dummy
      const user = a.userId || {
        _id: DUMMY_USER_ID,
      };

      return {
        ...a.toObject(),
        userId: user,
        unreadCount,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Get Aduan by User ID
exports.getAduanByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const allowedStatuses = ['Problem', 'Prioritize', 'Developer', 'Solved'];

    const aduans = await Aduan.find({
      userId,
      status: { $in: allowedStatuses }
    }).sort({ createdAt: -1 }); // Urutkan terbaru dulu

    const result = aduans.map((a) => {
      const unreadCount = a.percakapan.filter(p =>
        p.senderType === 'userInternal' && p.seen === false
      ).length;

      return {
        ...a.toObject(),
        unreadCount,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Get Aduan by ID
exports.getAduanById = async (req, res) => {
  try {
    const aduan = await Aduan.findById(req.params.id)
      .populate('userId', 'userName')
      .populate('modul_pic', 'userName');

    res.json(aduan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Percakapan by Aduan ID
exports.getPercakapanByAduanId = async (req, res) => {
  try {
    const aduan = await Aduan.findById(req.params.id)
      .populate({
        path: 'percakapan.sender',
        select: 'userName imageName email userPhone' // hanya ambil field ini
      });

    res.json(aduan.percakapan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPercakapanCS = async (req, res) => {
  const { userId } = req.params;

  try {
    const aduan = await Aduan.find({
      userId,
      status: { $in: ["Progress", "Done"] }
    }).select('_id status percakapan');

    res.status(200).json(aduan);
  } catch (error) {
    console.error("Error fetching percakapan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};



// Mark Percakapan as Seen
exports.markAsSeen = async (req, res) => {
  const { aduanId, bySenderType } = req.body;
  try {
    const aduan = await Aduan.findById(aduanId);
    aduan.percakapan.forEach(p => {
      if (p.senderType !== bySenderType) {
        p.seen = true;
      }
    });
    await aduan.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change Status
exports.changeStatus = async (req, res) => {
  const { aduanId, status, modul_pic } = req.body;
  try {
    const aduan = await Aduan.findById(aduanId);
    aduan.status = status;

    if (!aduan.modul_pic.includes(modul_pic)) {
      aduan.modul_pic.push(modul_pic);
    }

    await aduan.save();
    res.json(aduan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add Solusi
exports.addSolusi = async (req, res) => {
  const { aduanId, solusi, modul_pic } = req.body;
  try {
    const aduan = await Aduan.findById(aduanId);
    aduan.solusi = solusi;
    aduan.status = "Solved";

    if (!aduan.modul_pic.includes(modul_pic)) {
      aduan.modul_pic.push(modul_pic);
    }

    await aduan.save();
    res.json(aduan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getLastMessagesByChat = async (req, res) => {
  try {
    const { userId } = req.query; // ini user internal
    const objectId = new mongoose.Types.ObjectId(userId);

    // Ambil semua aduan status Progress, tanpa filter modul_pic
    const aduans = await Aduan.aggregate([
      {
        $match: {
          status: "Progress"
        }
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$percakapan", -1] }
        }
      },
      {
        $sort: { "lastMessage.waktu": -1 }
      }
    ]);

    const result = await Promise.all(
      aduans.map(async (chat) => {
        // Ambil data user eksternal
        const user = await UserEksternal.findById(chat.userId).select("userName imageName _id");

        return {
          aduanId: chat._id,
          userID: user?._id || "Unknown",
          name: user?.userName || chat.nama || "Unknown",
          imageName: user?.imageName || "",
          email: chat.email || "-",
          noTelp: chat.noTelp || "-",
          priority: chat.priority || "-",
          description: chat.description || "-",
          lastMessage: chat.lastMessage?.message || "",
          lastSeen: chat.lastMessage?.seen || false,
          lastTime: chat.lastMessage?.waktu || null,
          unreadCount: chat.percakapan.filter(p =>
            p.senderType === "userEksternal" && p.seen === false
          ).length,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getLastMessagesByChat:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getLastMessagesDone = async (req, res) => {
  try {
    const { userId } = req.query; // ini user internal
    const objectId = new mongoose.Types.ObjectId(userId);

    // Ambil semua aduan status Progress, tanpa filter modul_pic
    const aduans = await Aduan.aggregate([
      {
        $match: {
          status: "Done"
        }
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$percakapan", -1] }
        }
      },
      {
        $sort: { "lastMessage.waktu": -1 }
      }
    ]);

    const result = await Promise.all(
      aduans.map(async (chat) => {
        // Ambil data user eksternal
        const user = await UserEksternal.findById(chat.userId).select("userName imageName _id");

        return {
          aduanId: chat._id,
          userID: user?._id || "Unknown",
          name: user?.userName || chat.nama || "Unknown",
          imageName: user?.imageName || "",
          email: chat.email || "-",
          noTelp: chat.noTelp || "-",
          priority: chat.priority || "-",
          description: chat.description || "-",
          lastMessage: chat.lastMessage?.message || "",
          lastSeen: chat.lastMessage?.seen || false,
          lastTime: chat.lastMessage?.waktu || null,
          unreadCount: chat.percakapan.filter(p =>
            p.senderType === "userEksternal" && p.seen === false
          ).length,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getLastMessagesByChat:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createAduanWithPercakapan = async (req, res) => {
  try {
    const {
      userId,
      sender,
      senderType = "userEksternal",
      message,
      nama,
      noTelp,
      email,
      priority,
      description
    } = req.body;

    // Validasi pesan wajib diisi
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Pesan tidak boleh kosong." });
    }

    // Gunakan DUMMY jika kosong/null/""
    const finalUserId = (!userId || userId === "") ? DUMMY_USER_ID : userId;
    const finalSender = (!sender || sender === "") ? DUMMY_USER_ID : sender;

    const aduan = new Aduan({
      userId: finalUserId,
      aduan: "Customer Service",
      status: "Progress",
      solusi: "Berbicara dengan customer service",
      nama,
      noTelp,
      email,
      priority,
      description,
      percakapan: [
        {
          sender: finalSender,
          senderType,
          message
        }
      ]
    });

    const saved = await aduan.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating aduan:", err);
    res.status(500).json({ message: err.message });
  }
};

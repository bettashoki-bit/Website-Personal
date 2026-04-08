const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());


const TOKEN = "pkd5Hsg1AuVhPtMwrY7G";

function formatNomorWA(nomor) {
    if (!nomor) return "";
    nomor = nomor.replace(/\D/g, "");

    if (nomor.startsWith("0")) {
        return "62" + nomor.slice(1);
    }
    if (nomor.startsWith("62")) {
        return nomor;
    }
    if (nomor.startsWith("8")) {
        return "62" + nomor;
    }
    return nomor;
}


async function kirimWa(target, message) {
    try {
        console.log("KIRIM KE:", target);
        console.log("ISI PESAN:", message);

        const res = await axios.post("https://api.fonnte.com/send", {
            target,
            message
        }, {
            headers: {
                Authorization: TOKEN
            }
        });
        console.log("RESPON FONTTE:", res.data);
    } catch (err) {
        console.log("ERROR FONTTE:", err.response?.data || err.message);

    }

}

app.get("/", (req, res) => {
    res.send("SEVER HIDUP")
});



app.post("/checkout", async (req, res) => {
    const { keranjang, total } = req.body;

    let text = " 🧾 PESANAN BARU\n\n";

    keranjang.forEach(item => {
        text += `- ${item.nama} x${item.qty}\n`;
    });
    text += `\nTotal: Rp${total}`;

    try {
        await kirimWa("6282267056614", text);
        res.json({ status: "ok" });
    } catch {
        res.status(500).json({ status: "error", message: "Gagal kirim WA" });
    }
});


app.post("/webhook", async (req, res) => {

    console.log("MASUK WEBHOOK 🔥");
    console.log(req.body);

    const pesan = req.body.message?.toLowerCase() || "";
    const nomor = formatNomorWA(req.body?.sender);
    const gambar = req.body?.url || req.body.image || req.body?.media;



    console.log("Pesan:", pesan);
    console.log("Nomor:", nomor);

    if (pesan) {
        console.log("ADA PESANAN MASUK")
    }

    if (pesan && pesan.includes("pesan")) {

        console.log("DETECTED PESAN ✅");
        console.log("TARGET KIRIM:", nomor);
        console.log("TRIGGER BALASAN AKTIF 🔥");

        await kirimWa(nomor,
            `Terima kasih sudah memesan makannya🙏
            
Silahkan kirim bukti pembayaran💸
Pesanan akan segara diproses setelah pembayaran✅`);
    }

    if (gambar) {
        await kirimWa(nomor,
            `Bukti diterima ✅
        Pesanan sedang diproses 🔥`);
    }

    res.send("ok");
});

app.listen(3000, () => {
    console.log("server jalan di htpp://localhost:3000 🚀");
});

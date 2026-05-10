const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.FROM_EMAIL || 'Vendora <noreply@vendora.com>';
const BASE_URL = process.env.CLIENT_URL || 'https://vendora.vercel.app';

async function send({ to, subject, html }) {
    if (!RESEND_API_KEY) {
        console.log(`[Email] ${subject} → ${to}`);
        return;
    }
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from: FROM, to: [to], subject, html }),
        });
        if (!res.ok) console.error('[Email] Failed:', await res.text());
    } catch (e) {
        console.error('[Email] Error:', e.message);
    }
}

const PAYMENT_LABELS = {
    COD: 'Cash on Delivery',
    MOBILE_MONEY: 'Mobile Money',
    BANK_TRANSFER: 'Bank Transfer',
};

function base(content) {
    return `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0f0f0f;color:#e5e5e5;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center">
        <h1 style="margin:0;color:white;font-size:24px;font-weight:800">Vendora</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px">The free affiliate marketplace</p>
      </div>
      <div style="padding:32px">${content}</div>
      <div style="padding:20px 32px;border-top:1px solid #1f1f1f;text-align:center;font-size:12px;color:#6b7280">
        © 2026 Vendora · <a href="${BASE_URL}" style="color:#7c3aed;text-decoration:none">Visit platform</a>
      </div>
    </div>`;
}

function btn(href, label) {
    return `<a href="${href}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:20px">${label}</a>`;
}

function row(label, value) {
    return `<tr><td style="padding:8px 0;color:#9ca3af;font-size:14px">${label}</td><td style="padding:8px 0;color:#e5e5e5;font-weight:500;font-size:14px">${value}</td></tr>`;
}

export async function sendNewOrderEmailToMerchant({ merchant, order, product }) {
    await send({
        to: merchant.email,
        subject: `🛒 Nouvelle commande — ${product.title}`,
        html: base(`
            <h2 style="color:white;margin-top:0">Nouvelle commande reçue !</h2>
            <p style="color:#9ca3af">Bonjour <strong style="color:#e5e5e5">${merchant.name}</strong>,</p>
            <p style="color:#9ca3af">Un client vient de commander <strong style="color:#e5e5e5">${product.title}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
                ${row('Client', order.customerName)}
                ${row('Téléphone', order.customerPhone)}
                ${row('Adresse', order.customerAddress)}
                ${row('Paiement', PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod)}
                ${row('Total commande', `$${order.amount.toFixed(2)}`)}
                ${row('Vos gains', `<span style="color:#34d399">$${order.merchantEarnings.toFixed(2)}</span>`)}
            </table>
            ${order.customerEmail ? `<p style="color:#9ca3af;font-size:13px">Email client : ${order.customerEmail}</p>` : ''}
            ${btn(`${BASE_URL}/dashboard`, 'Voir dans le dashboard')}
        `),
    });
}

export async function sendOrderConfirmationToCustomer({ customerEmail, customerName, order, product }) {
    if (!customerEmail) return;
    await send({
        to: customerEmail,
        subject: `✅ Commande confirmée — ${product.title}`,
        html: base(`
            <h2 style="color:white;margin-top:0">Commande confirmée !</h2>
            <p style="color:#9ca3af">Bonjour <strong style="color:#e5e5e5">${customerName}</strong>,</p>
            <p style="color:#9ca3af">Votre commande pour <strong style="color:#e5e5e5">${product.title}</strong> a bien été enregistrée.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
                ${row('N° commande', `#${order.id.split('-')[0].toUpperCase()}`)}
                ${row('Montant', `$${order.amount.toFixed(2)}`)}
                ${row('Paiement', PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod)}
                ${row('Adresse', order.customerAddress)}
            </table>
            <p style="color:#9ca3af;font-size:14px">Le marchand va vous contacter prochainement pour confirmer la livraison.</p>
        `),
    });
}

export async function sendCommissionEarnedToVendor({ vendor, product, amount }) {
    await send({
        to: vendor.email,
        subject: `💰 Commission gagnée — $${amount.toFixed(2)} sur ${product.title}`,
        html: base(`
            <h2 style="color:white;margin-top:0">Vous avez gagné une commission !</h2>
            <p style="color:#9ca3af">Bonjour <strong style="color:#e5e5e5">${vendor.name}</strong>,</p>
            <p style="color:#9ca3af">Une vente a été réalisée via votre lien affilié pour <strong style="color:#e5e5e5">${product.title}</strong>.</p>
            <div style="background:#052e16;border:1px solid #166534;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
                <p style="margin:0;color:#86efac;font-size:13px">Commission gagnée</p>
                <p style="margin:8px 0 0;color:#34d399;font-size:32px;font-weight:800">$${amount.toFixed(2)}</p>
                <p style="margin:4px 0 0;color:#6b7280;font-size:12px">Statut : En attente de validation</p>
            </div>
            <p style="color:#9ca3af;font-size:13px">La commission passe à "Approuvée" quand le marchand marque la commande comme complétée.</p>
            ${btn(`${BASE_URL}/dashboard`, 'Voir mon wallet')}
        `),
    });
}

export async function sendOrderStatusUpdateToCustomer({ customerEmail, customerName, order, product }) {
    if (!customerEmail) return;
    const config = {
        PROCESSING: { emoji: '⚙️', label: 'En traitement', msg: 'Votre commande est en cours de traitement par le marchand.' },
        SHIPPED: { emoji: '🚚', label: 'Expédiée', msg: 'Votre commande a été expédiée ! Elle est en route.' },
        COMPLETED: { emoji: '✅', label: 'Livrée', msg: 'Votre commande a été livrée. Merci pour votre achat !' },
        CANCELLED: { emoji: '❌', label: 'Annulée', msg: 'Votre commande a été annulée. Contactez le marchand pour plus d\'informations.' },
    };
    const c = config[order.status];
    if (!c) return;
    await send({
        to: customerEmail,
        subject: `${c.emoji} Commande ${c.label} — ${product.title}`,
        html: base(`
            <h2 style="color:white;margin-top:0">${c.emoji} Commande ${c.label}</h2>
            <p style="color:#9ca3af">Bonjour <strong style="color:#e5e5e5">${customerName}</strong>,</p>
            <p style="color:#9ca3af">${c.msg}</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
                ${row('Produit', product.title)}
                ${row('N° commande', `#${order.id.split('-')[0].toUpperCase()}`)}
                ${row('Statut', `<strong style="color:#e5e5e5">${c.label}</strong>`)}
            </table>
        `),
    });
}

export async function sendPasswordResetEmail(to, name, resetUrl) {
    await send({
        to,
        subject: 'Réinitialisation de votre mot de passe Vendora',
        html: base(`
            <h2 style="color:white;margin-top:0">Réinitialiser votre mot de passe</h2>
            <p style="color:#9ca3af">Bonjour <strong style="color:#e5e5e5">${name}</strong>,</p>
            <p style="color:#9ca3af">Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez ci-dessous — le lien expire dans <strong style="color:#e5e5e5">1 heure</strong>.</p>
            ${btn(resetUrl, 'Réinitialiser mon mot de passe')}
            <p style="color:#6b7280;font-size:13px;margin-top:24px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        `),
    });
}

export async function sendPayoutRequestNotification({ vendor, amount, method }) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    await send({
        to: adminEmail,
        subject: `💸 Demande de payout — $${amount.toFixed(2)} de ${vendor.name}`,
        html: base(`
            <h2 style="color:white;margin-top:0">Nouvelle demande de payout</h2>
            <p style="color:#9ca3af"><strong style="color:#e5e5e5">${vendor.name}</strong> (${vendor.email}) demande un paiement.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
                ${row('Montant', `<span style="color:#34d399">$${amount.toFixed(2)}</span>`)}
                ${row('Méthode', method)}
            </table>
            ${btn(`${BASE_URL}/dashboard`, 'Traiter dans le dashboard admin')}
        `),
    });
}

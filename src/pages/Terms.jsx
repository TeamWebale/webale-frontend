/**
 * Terms.jsx — src/pages/Terms.jsx
 * Terms and Conditions for Webale web-app platform
 */
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Terms &amp; Conditions</h1>
            <p style={s.subtitle}>Webale! Private Group Fundraising Platform</p>
            <p style={s.date}>Last updated: {today}</p>
          </div>
          <button onClick={() => navigate(-1)} style={s.closeBtn}>✕</button>
        </div>

        <div style={s.body}>

          <section style={s.section}>
            <h2 style={s.heading}>1. Introduction &amp; Acceptance</h2>
            <p style={s.text}>
              Welcome to Webale! ("Platform", "we", "us", "our"). By creating an account, accessing, or using our web-app platform at webale.net, you ("User", "you", "your") agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Platform.
            </p>
            <p style={s.text}>
              Webale! is a private group fundraising platform that automates hitherto manually kept fundraising records and operations. We provide tools for invitation-only fundraising groups to manage pledges, contributions, communications, and progress tracking.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>2. Eligibility</h2>
            <p style={s.text}>
              You must be at least 18 years of age to create an account and use the Platform. By registering, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>3. Account Registration &amp; Security</h2>
            <p style={s.text}>
              You are responsible for maintaining the confidentiality of your login credentials. You agree to provide accurate, current, and complete information during registration and to update such information as necessary. You are solely responsible for all activity that occurs under your account.
            </p>
            <p style={s.text}>
              We reserve the right to suspend or terminate accounts that violate these Terms, contain false information, or are used for fraudulent purposes.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>4. Platform Services</h2>
            <p style={s.text}>
              Webale! provides the following services, which may evolve over time:
            </p>
            <ul style={s.list}>
              <li><strong>Private Group Creation</strong> — Invitation-only fundraising groups where only trusted participants (family, friends, colleagues, communities) can join.</li>
              <li><strong>Pledge Management</strong> — One-time or recurring pledges (revisable and deletable), partial payments, and offline/offshore donation recording by group admins.</li>
              <li><strong>Multi-Currency Support</strong> — Pledging in 160+ currencies with built-in conversion estimates for cross-border fundraising.</li>
              <li><strong>Progress Tracking</strong> — Live donor feed, milestone badges, progress bars, sub-goals, and transparent audit trails.</li>
              <li><strong>Communication</strong> — In-app direct and group messaging, automated welcome messages, and notification/reminder systems.</li>
              <li><strong>Admin Controls</strong> — Membership management, role assignment, user blocking, group ownership transfer, and data export (CSV/PDF).</li>
              <li><strong>Invitation System</strong> — Multi-use or single-use invite links shareable via WhatsApp, QR code, or email.</li>
            </ul>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>5. Nature of the Platform — No Payment Processing</h2>
            <p style={s.text}>
              <strong>Webale! is a tracking and coordination platform, not a payment processor.</strong> We do not handle, hold, transfer, or process any money or financial transactions. The Platform tracks pledges, commitments, and contribution records. Actual money transfers occur through whatever external channels your group chooses (bank transfers, mobile money, cash, etc.).
            </p>
            <p style={s.text}>
              Webale! bears no responsibility for the actual transfer, receipt, or safekeeping of funds between group members. All financial transactions are conducted independently between parties at their own risk.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>6. User Responsibilities &amp; Conduct</h2>
            <p style={s.text}>You agree to:</p>
            <ul style={s.list}>
              <li>Use the Platform only for lawful fundraising purposes.</li>
              <li>Not use the Platform to facilitate fraud, money laundering, or any illegal activity.</li>
              <li>Not impersonate other individuals or misrepresent your identity.</li>
              <li>Not harass, abuse, or send threatening messages to other users.</li>
              <li>Not attempt to gain unauthorised access to other users' accounts or data.</li>
              <li>Not upload malicious content, spam, or disruptive material.</li>
              <li>Respect the privacy of other group members and their personal information.</li>
            </ul>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>7. Group Admin Responsibilities</h2>
            <p style={s.text}>
              Group administrators bear additional responsibilities including but not limited to: ensuring their fundraising purpose is lawful and legitimate, accurately recording contributions, managing membership responsibly, and resolving disputes within their groups. Webale! is not responsible for the actions or decisions of group administrators.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>8. Privacy &amp; Data Protection</h2>
            <p style={s.text}>
              We collect and process personal data necessary to provide our services, including your name, email address, and fundraising activity within groups. Your data is stored securely and is not sold to third parties.
            </p>
            <p style={s.text}>
              Group members can see your name, pledges, and contributions within groups you belong to — this transparency is a core feature of the Platform. Pledges marked as "anonymous" will be displayed under the name "John Doe" on activity boards.
            </p>
            <p style={s.text}>
              You may request export or deletion of your personal data by contacting us or through your account settings.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>9. Currency Conversion</h2>
            <p style={s.text}>
              The Platform provides currency conversion estimates for informational purposes only. Exchange rates are approximate and are sourced from publicly available data. Webale! does not guarantee the accuracy of conversion rates and is not liable for any discrepancies between displayed estimates and actual exchange rates at the time of any financial transaction.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>10. Messaging &amp; Communications</h2>
            <p style={s.text}>
              The Platform includes in-app messaging features. Automated messages (welcome messages, pledge acknowledgements, reminders) are sent on behalf of group administrators. Users may block other users from messaging them. Users are responsible for the content of messages they send and must not use messaging for harassment, spam, or illegal purposes.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>11. Intellectual Property</h2>
            <p style={s.text}>
              All content, design, logos, and software comprising the Webale! platform are the intellectual property of Webale and are protected by applicable copyright and trademark laws. You may not copy, modify, distribute, or reverse-engineer any part of the Platform without prior written consent.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>12. Fees &amp; Premium Features</h2>
            <p style={s.text}>
              The Platform is currently free to use. With time, a section of functions will be categorised as premium (optional) and a modest fee will be charged to cover costs of operations, maintenance, subscriptions, research, and development. Users will be notified in advance of any changes to the fee structure.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>13. Limitation of Liability</h2>
            <p style={s.text}>
              To the maximum extent permitted by law, Webale! and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to: loss of funds due to actions of other users, disputes between group members, inaccurate currency conversions, data loss, or service interruptions.
            </p>
            <p style={s.text}>
              The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>14. Dispute Resolution</h2>
            <p style={s.text}>
              Disputes between group members are the responsibility of the group and its administrators. Webale! does not mediate or adjudicate financial disputes between users. For disputes relating to the Platform itself, you agree to first attempt resolution through our support channels before pursuing any legal action.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>15. Termination</h2>
            <p style={s.text}>
              You may delete your account at any time through your account settings. We may suspend or terminate your access if you violate these Terms. Upon termination, your data will be handled in accordance with our data retention policies and applicable law.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>16. Modifications to Terms</h2>
            <p style={s.text}>
              We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the Platform after modifications constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section style={s.section}>
            <h2 style={s.heading}>17. Contact</h2>
            <p style={s.text}>
              For questions, concerns, or feedback regarding these Terms and Conditions, please use the Feedback button within the Platform or contact us at the email address provided in your account settings.
            </p>
          </section>

          <div style={s.footer}>
            <p style={s.footerText}>© {new Date().getFullYear()} Webale! — All rights reserved.</p>
            <button onClick={() => navigate(-1)} style={s.backBtn}>← Go Back</button>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: '100%',
    padding: '0',
  },
  card: {
    background: '#fff',
    borderRadius: '0',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '28px 28px 20px',
    background: 'linear-gradient(135deg, #1B2D4F 0%, #4A7FC1 100%)',
    color: '#fff',
  },
  title: {
    margin: '0 0 4px', fontSize: '24px', fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '0 0 6px', fontSize: '14px', fontWeight: 400, opacity: 0.85,
  },
  date: {
    margin: 0, fontSize: '12px', opacity: 0.65,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    fontSize: '16px', color: '#fff', cursor: 'pointer',
    padding: '6px 10px', borderRadius: '8px', fontWeight: 700, flexShrink: 0,
  },
  body: {
    padding: '24px 28px 32px',
    maxHeight: 'calc(100vh - 220px)',
    overflowY: 'auto',
  },
  section: {
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f0f4f9',
  },
  heading: {
    fontSize: '16px', fontWeight: 700, color: '#1B2D4F',
    margin: '0 0 10px',
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  text: {
    fontSize: '14px', lineHeight: '1.7', color: '#4a5568',
    margin: '0 0 10px',
  },
  list: {
    fontSize: '14px', lineHeight: '1.8', color: '#4a5568',
    margin: '8px 0', paddingLeft: '20px',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '20px', borderTop: '2px solid #1B2D4F',
    marginTop: '12px',
  },
  footerText: {
    fontSize: '13px', color: '#8899AA', fontWeight: 500, margin: 0,
  },
  backBtn: {
    background: 'linear-gradient(135deg, #1B2D4F, #4A7FC1)',
    color: '#fff', border: 'none', borderRadius: '8px',
    padding: '8px 16px', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer',
  },
};

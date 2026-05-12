// Disposable / throwaway email domain blocklist.
//
// Curated subset of the disposable/disposable-email-domains list
// (https://github.com/disposable/disposable-email-domains) — kept
// inline rather than pulled at build time to (a) avoid an outbound
// HTTP at every build, (b) keep the bundle deterministic, (c) avoid
// shipping a 50KB-list when ~150 domains catch the long tail.
//
// Maintenance: review yearly. Adding a domain is cheap; removing one
// is risky (someone's actual email could be at @example.com).
//
// On match the server returns 200 OK with no D1 write — the bot can't
// distinguish "blocked" from "accepted", so it stops retrying and we
// keep our sender reputation clean at launch.

const RAW = [
  // mailinator family
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.us',
  '10minutemail.co.uk', '10minutemail.de',
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailinator2.com',
  // guerrilla mail
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamailblock.com', 'sharklasers.com', 'grr.la',
  // temp-mail
  'temp-mail.org', 'tempmail.com', 'tempmailo.com', 'tempmail.net', 'tempmailaddress.com',
  'temp-mail.io', 'tempm.com', 'tempinbox.com', 'tempemail.net',
  // throwaway
  'throwawaymail.com', 'throwawayemailaddresses.com', 'throwam.com',
  'fakeinbox.com', 'fakemail.fr', 'fakemailgenerator.com', 'fakebox.org',
  // YOPmail
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc',
  'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf',
  // dispostable
  'dispostable.com', 'discard.email', 'discardmail.com', 'discardmail.de',
  // emailondeck / spamgourmet
  'emailondeck.com', 'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  // mvrht / nada / getairmail
  'mvrht.com', 'nada.email', 'nada.ltd', 'getairmail.com', 'getnada.com',
  // maildrop
  'maildrop.cc', 'maildrop.cf', 'maildrop.ga', 'maildrop.gq', 'maildrop.ml',
  // mohmal / harakirimail / trashmail
  'mohmal.com', 'mohmal.in', 'mohmal.tech',
  'harakirimail.com', 'trashmail.com', 'trashmail.de', 'trashmail.io', 'trashmail.me',
  'trashmail.net', 'trashmail.ws', 'trash-mail.com', 'trash-mail.de',
  // sneakemail / inboxbear
  'sneakemail.com', 'inboxbear.com', 'inboxalias.com', 'inbox.lv',
  // mintemail / spam.la / suremail
  'mintemail.com', 'spam.la', 'suremail.info',
  // emltmp / wegwerf
  'emltmp.com', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'wegwerfemail.de',
  // jetable / armymail
  'jetable.com', 'jetable.org', 'jetable.net', 'armyspy.com', 'cuvox.de', 'dayrep.com',
  'einrot.com', 'fleckens.hu', 'gustr.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  // 33mail / mailcatch
  '33mail.com', 'mailcatch.com',
  // mailnesia
  'mailnesia.com',
  // mintmaildot
  'mintmaildot.com',
  // tempmailaddress family
  '5ymail.com', '5mail.cc', '20minutemail.com', '20minutemail.it',
  // mail-temporaire / mail-temp
  'mail-temporaire.fr', 'mail-temp.com', 'mailtemp.info',
  // misc throwaway
  'mailexpire.com', 'mailfa.tk', 'mailforspam.com', 'mailimate.com', 'mailme.lv',
  'mailmoat.com', 'mailtemporaire.com', 'mailtothis.com', 'mailzilla.com',
  'mailtemp.uk', 'mail-temporaire.com',
  // moakt
  'moakt.com', 'moakt.cc', 'moakt.ws',
  // protonmail-throwaway alternatives often abused
  'meltmail.com', 'spambox.us', 'tempsky.com', 'spamfree24.org',
  // burner.kiwi family
  'burner.kiwi',
  // ten-min mail
  'tenmail.org', 'tenminutemail.com', 'tenminutemail.net', 'tenminutemail.cf',
  // luxusmail / mytemp
  'luxusmail.org', 'mytemp.email', 'mytemp.online',
  // disposeamail
  'disposeamail.com', 'disposemail.com', 'disposable.email',
  // bouncr / mailtrash
  'bouncr.com', 'mailtrash.net',
  // High-traffic 2024-2026 additions
  'mail.tm', 'tmpmail.org', 'tmpmail.net', 'dropmail.me', 'mail7.io',
  'email-fake.com', 'emkei.cz', 'vmani.com', 'byom.de', 'inboxkitten.com',
  'mailinator.live', 'tempmailo.org', 'linshiyou.com', 'spamdecoy.net',
  'fakerinbox.com', 'sogetthis.com', 'rootfest.net', 'kiani.com',
  // bunch of *.tk / *.ga / *.ml throwaway
  // (intentionally not blocking entire TLDs — false positives too high)
];

// Lowercased Set for O(1) lookup. Frozen so module-level mutation
// can't happen accidentally at runtime.
export const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set(
  RAW.map((d) => d.toLowerCase()),
);

/**
 * Namespace `core`, français (fr), translated from the English source: sentences that `@seek-fw/core` makes and
 * the page shows. A key is a core message code (packages/core/src/message.ts):
 * core gives the page `{ code, params, text }`, and `coreText()`
 * (lib/core-text.ts) renders `core:<code>` with the params. English must
 * render to core's `text` word for word: i18n/core-messages.test.ts renders
 * every key here for representative inputs and compares, so the CLI and the
 * page keep saying the same thing in English. Don't reword a template here
 * without rewording core, and the other way round.
 *
 * For translators (the `core` namespace):
 * - Every value here is a sentence core also prints in English (the CLI, the
 *   logs, the copyable report). Translate the sentence; keep its `{params}`.
 * - Params that arrive ALREADY TRANSLATED (another core message, or a page word):
 *   - a bank: `{bank}`, `{name}`, `{first}`, `{second}`, `{last}`, `{target}`.
 *     Inside a sentence it is "slot A" / "recovery R" (common:bank.*InSentence);
 *     where the English starts a sentence or names a row it is the label form
 *     "Slot A" / "Recovery R". `{first}`/`{second}`/`{last}` in boot.rule may be
 *     a bare letter ("A").
 *   - a key name: `{key}`, `{held}`, `{holds}`, `{masks}` (keyName.*: "Key A",
 *     "per-device key", …; `{masks}` is several, joined with commas).
 *   - a nested sentence: `{why}`, `{reason}`, `{verdict}`, `{risk}`,
 *     `{untested}`, `{outcome}`, `{failure}`, `{answers}`, `{predicted}`,
 *     `{plain}`, `{ff}`, `{reference}`, `{recovered}`, `{check}`, `{phrase}`,
 *     `{staged}`, `{source}`, `{operation}`, `{error}`, `{label}`, `{writable}`,
 *     `{next}`, `{form}`, `{notes}`, `{remedy}`, `{capability}`, `{pair}`
 *     (report.checkKey.pair, or nothing), `{said}` (detect.source.*), `{context}`, and `{note}` in
 *     preserve.refused.recoveryOnly and identity.versionUnknown. Each is another key of
 *     this namespace (the comment above a key says which), already in your
 *     language. A `{why}` that starts a sentence arrives with a capital letter.
 *   - a list: `{banks}`, `{reasons}`, `{masks}`, `{files}`, `{sites}`, `{places}`,
 *     `{context}`, `{notes}` (joined with your common:list.* words; where the
 *     English uses a semicolon, common:list.semicolon; `{reasons}` in
 *     writeRefusal.otherFamily is detect.* sentences).
 * - Params that stay AS THEY ARE: hex values and offsets (`{word}`, `{offset}`,
 *   `{sum}`, `{hex}`, `{address}`, `{at}`, `{status}`, `{magic}`, `{length}`,
 *   `{k}`, `{zero}`, `{block}`), byte counts (`{size}`, `{count}`, `{kib}`), mode numbers (`{mode}`),
 *   a score (`{score}`), firmware versions (`{version}`, `{image}`, `{camera}`,
 *   `{firmware}`, `{builds}`, `{only}`, and `{first}` in support.* and detect.*), file
 *   names (`{file}`), a SHA-256 (`{sha256}`), a selector table's name
 *   (`{table}`) and family names (`{family}`, `{detected}`).
 * - Still English inside a translated sentence (core gives them no code yet):
 *   `{error}` when the error has no code (a USB error, a ZIP reader's error,
 *   a bug, or a refusal only a broken run file reaches, such as the patch
 *   builder's own gates), a read reason (read.reason.*'s place) that came
 *   from such an error, `{signature}` in preserve.fail.* (it describes the
 *   bytes or the wire stall; people paste it to the owner), `{reasons}` in
 *   preserve.fail.spentReaderDerive, `{note}` in preserve.gate.drainRefused,
 *   `{gap}` in restore.refused.gap*, and `{mismatch}` in
 *   slots.image.keyMismatch.
 * - Capitals: keep the English's. A template that starts lower case is said
 *   inside another sentence or after a label ("Note: …", a list item, "Not
 *   read: …"); one that starts upper case stands alone.
 * - Names stay English: command names (GetFirmwareInfo, CompleteMemoryUpgrade,
 *   BeginFirmwareUpgrade), wire ids, mode numbers, header fields
 *   (`header.length`, "CODE"), PRESERVATION.md, UNTESTED.
 *
 * Owner: phase 3 (core messages). Phase 1 put the unlock note here as the
 * first entry.
 */

import type { Translation } from '../../types';

export default {
  /** `UNLOCK_POWER_CYCLE_NOTE`; the page shows it as "Note: …." (app:unlockNote). */
  'unlock.powerCycleNote':
    'la caméra reste déverrouillée jusqu’à ce qu’elle soit éteinte puis rallumée, et d’ici là d’autres outils risquent de mal la lire ; éteignez-la puis rallumez-la avant de les utiliser',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': '{first} d’abord, puis {second}, puis {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'n’a pas été lu',
  'boot.verdict.checkKeyUnnamed':
    'n’a pas pu être vérifié : la clé sous laquelle son bootloader vérifie un emplacement n’a pas été identifiée',
  'boot.cfg0NotRead':
    'le mot de configuration de démarrage (cfg[0]) n’a pas été lu : on ne sait donc pas quel emplacement exécute le prochain démarrage',
  'boot.select.unknown':
    'le mot de configuration de démarrage vaut {word} : le bootloader essaie donc d’abord {first:acc}, mais {bank:acc} {verdict} ; on ne sait donc pas quel emplacement s’exécute',
  'boot.select.first':
    'le mot de configuration de démarrage vaut {word} : le bootloader essaie donc d’abord {first:acc}, qui contient une image que le bootloader accepte',
  'boot.select.second':
    'le mot de configuration de démarrage vaut {word} : le bootloader essaie donc d’abord {first:acc} ; {first:acc} ne contient aucune image que le bootloader accepte, il prend donc {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'le mot de configuration de démarrage vaut {word} : le bootloader essaie donc d’abord {first:acc} ; ni {first:acc} ni {second:acc} ne contiennent d’image que le bootloader accepte, il démarre donc {last:acc}, qu’il ne vérifie pas',
  'boot.select.lastTakes':
    'le mot de configuration de démarrage vaut {word} : le bootloader essaie donc d’abord {first:acc} ; ni {first:acc} ni {second:acc} ne contiennent d’image que le bootloader accepte, il prend donc {last:acc}, qu’il ne vérifie pas',
  'boot.bootsNow': '{bank:ins} est l’emplacement depuis lequel la caméra démarre actuellement',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'démarré',
  'boot.notBooted': 'non démarré',
  'boot.unknownWhy.checkKeyUnnamed':
    'la clé sous laquelle son bootloader vérifie un emplacement n’a pas été identifiée lors de cette lecture',
  'boot.unknownWhy.noKeyTable':
    'la table des clés du bootloader n’a pas été lue : les clés qu’il essaie ne peuvent donc pas être identifiées',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'La caméra démarre depuis {bank:acc}. {why}.',
  'fpsBoot.holdsOne':
    '{bank} : contient un correctif de fréquence d’images, mais cet emplacement ne s’exécute pas ; le correctif ne prend donc pas effet.',
  'fpsBoot.holdsTwo':
    '{banks} : ces emplacements contiennent des correctifs de fréquence d’images, mais aucun ne s’exécute ; les correctifs ne prennent donc pas effet.',
  'fpsBoot.wouldNotRun':
    'Corriger {target:acc} ne le ferait pas démarrer, car la caméra démarre depuis {bank:acc} à la place.',
  'fpsBoot.patchRunning':
    'Corrigez aussi {bank:acc} (l’emplacement qui s’exécute) : c’est ce qui fait prendre effet au correctif de fréquence d’images.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} : ne peut pas être corrigé ici ({reason}) ; un correctif de fréquence d’images dans un autre emplacement ne prend donc pas effet sur cette caméra.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name:acc} (absent du plan de ce build : le zip le signale)',
  'backup.bank.unsupported':
    '{name:acc} (ce build ne peut pas le lire, {reason} : le zip le signale)',
  'backup.bank.empty':
    '{name:acc} (vide, chaque octet à 0xFF : le zip le signale, et l’écriture n’écrase aucun firmware)',
  'backup.bank.unread':
    '{name:acc} (la lecture des emplacements ne l’a pas atteint : le zip indique si la lecture faite avant l’écriture l’atteint)',
  'backup.bank.noKey':
    '{name:acc} (tel que stocké ; aucune clé retrouvée par cette lecture ne l’ouvre, il n’y a donc pas de fichier déchiffré)',
  'backup.bank.decrypted': '{name:acc} (tel que stocké, et déchiffré)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Avant toute écriture, on relit {banks} et on l’enregistre dans un seul zip, avec une note sur chaque fichier : {file}.',
  'backup.plan.many':
    'Avant toute écriture, on relit {banks} et on les enregistre dans un seul zip, avec une note sur chaque fichier : {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'chiffré pour que l’appareil le stocke sous la clé que contient l’emplacement démarré',
  'staging.detail.slotKeystreamCiphertext':
    'chiffré sous la clé de transfert propre à l’image (bloc de clés 0) ; la caméra le stocke sous la clé propre à l’emplacement',
  'staging.detail.plain': 'en clair, sans chiffrement',
  'staging.detail.keyAKeystream':
    'l’image 1.3.0.8 FF telle que l’app du fabricant la transfère (XOR clé A) — le build 16 Hz la stocke sous la clé B, pas sous forme de ces octets',
  'staging.detail.verbatim': 'tel quel — les octets exactement tels que fournis',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'aucune lecture',
  'copy.source.notInPlan': '{name:ins} n’est pas dans le plan de ce build',
  'copy.source.notRead':
    '{name:ins} n’a pas été lu ({reason}) : il n’y a donc aucune image à copier',
  'copy.source.empty': '{name:ins} est vide : il n’y a aucune image à copier',
  'copy.source.foreign':
    '{name:ins} ne contient aucune image de firmware que cette lecture reconnaît : il n’y a donc rien à copier',
  'copy.source.noKey':
    'aucune clé retrouvée par cette lecture n’ouvre {name:acc} : il n’y a donc aucune image déchiffrée à copier',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} à {address}, tel que la lecture des emplacements l’a déchiffré',
  'copy.fromVersion':
    '{name} à {address}, firmware {version}, tel que la lecture des emplacements l’a déchiffré',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'L’image est celle {name:gen}, telle que la lecture des emplacements l’a déchiffrée : {size} o, sha256 {sha256}.',
  'copy.noteVersion':
    'L’image est celle {name:gen}, telle que la lecture des emplacements l’a déchiffrée : firmware {version}, {size} o, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name:acc} de la sauvegarde (à {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} dans la sauvegarde complète de la flash {file}',
  'restore.fromVersion':
    '{where} dans la sauvegarde complète de la flash {file}, firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'une image de la flash de 4 Mo',
  'restore.kind.preserve-run': 'un fichier d’exécution Preserve',
  'restore.kind.dump': 'un zip de « Extraire et déchiffrer 4.x/Nano »',
  'restore.kind.all-selectors': 'un zip de « Extraire tous les sélecteurs »',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'une image',
  'restore.decryptedTo.firmware': 'le firmware {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'L’image est {where} dans {file}, {kind} : sha256 stocké {stored}, déchiffré en {decrypted} de {size} o (sha256 {sha256}).',
  'restore.note.imageEntry':
    'L’image est {where} dans {file}, {kind} (son {entry}) : sha256 stocké {stored}, déchiffré en {decrypted} de {size} o (sha256 {sha256}).',
  'restore.note.readBack':
    'Après l’écriture, l’emplacement relu est comparé aux octets stockés de l’emplacement dans la sauvegarde.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Le bloc d’identité de la sauvegarde désigne cette caméra (n° de série {serial}).',
  'restore.note.sameBytes':
    '{name:ins} contient déjà les octets stockés de la sauvegarde : l’écriture remet la même image en place.',
  'restore.warn.otherCamera':
    'Cette sauvegarde semble venir d’une autre caméra : son bloc d’identité indique le n° de série {theirs}, et le numéro de série de cette caméra est {camera}. Seule l’image {name:gen} est écrite ; rien de l’identité ni de l’étalonnage de cette autre caméra ne l’est.',
  'restore.warn.noIdentity':
    'Cette sauvegarde n’a pas de bloc d’identité à {address} : on ne peut donc pas dire de quelle caméra elle a été lue.',
  'restore.warn.serialNotRead':
    'Le numéro de série de la caméra n’a pas été lu : la sauvegarde (n° de série {serial}) ne peut donc pas lui être associée.',
  'restore.warn.otherFirmware':
    '{where} contient le firmware {version}, et la caméra exécute {camera} : la restauration met un autre firmware dans l’emplacement.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank:ins} n’a pas été relu : il n’est donc pas comparé à la sauvegarde.',
  'restore.readBack.equal': '{bank:ins} se relit octet pour octet tel que la sauvegarde le stocke.',
  'restore.readBack.differs':
    '{bank} : se relit différemment des octets stockés dans la sauvegarde sur {count} o (premier écart à {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, dérivée {bank:gen} démarré',
  'keys.derived.holds':
    '{key} (la clé de stockage), dérivée {bank:gen} démarré, qui contient {holds:acc}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, dérivée de l’emplacement démarré',
  'keys.derived.holdsUnnamed':
    '{key} (la clé de stockage), dérivée de l’emplacement démarré, qui contient {holds:acc}',
  'keys.ffVendor.staged':
    'l’image 1.3.0.8 FF (16 Hz) telle que l’app du fabricant la transfère : l’image XOR son propre bloc de clés 0 (clé A), fenêtre d’en-tête telle quelle, dans n’importe quel emplacement ; les clés de cette caméra ne sont pas utilisées',
  'keys.ffVendor.stored':
    'clé B : la caméra rechiffre l’envoi avec le bloc de clés 1 et stocke l’image sous celui-ci',
  'keys.imageBlock0.staged':
    'l’image sous son propre bloc de clés 0 (trouvé dans l’image par sa valeur), dans n’importe quel emplacement ; les clés de cette caméra ne sont pas utilisées',
  'keys.imageBlock0.storedUnnamed':
    'la clé sous laquelle son bootloader vérifie un emplacement (non identifiée lors de cette lecture) ; la caméra rechiffre l’envoi sous cette clé',
  'keys.imageBlock0.stored':
    '{key}, la clé sous laquelle son bootloader vérifie un emplacement ; la caméra rechiffre l’envoi sous cette clé',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (non testé) : aucun bootloader du build FF 16 Hz n’a été lu sur une caméra : on ne sait donc pas si l’emplacement écrit démarre. Avec le bootloader 0.9.0.0, une forme antérieure de cette image démarrait depuis l’emplacement de secours R ; cette forme-ci ne démarrera pas, car ce bootloader démarre l’emplacement de secours R tel qu’il est stocké, sans le décoder.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'L’image FF 16 Hz est envoyée sous la forme que seul le build 16 Hz {version} lit. Cette caméra écrit un emplacement sans vérifier l’image (son code source le dit, et une Compact 1.3.0.0 l’a fait lors d’un essai) : elle devrait donc écrire les octets tels qu’ils sont envoyés, et l’emplacement contiendra alors l’image sous une forme que cette caméra ne peut pas démarrer.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Rien ici n’affirme que la caméra la démarre.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast':
    'Les réponses de la caméra elle-même indiquent qu’elle exécute le build FF 16 Hz : {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'vérifie des données avant d’effacer un emplacement, et ces données passent cette vérification : il peut donc écrire ces octets tels quels, sous une forme que son bootloader ne peut pas démarrer, et l’emplacement risque de ne pas démarrer (non essayé ; la sauvegarde enregistrée avant l’écriture permet de le remettre en état)',
  'write.ff.outcome.refuses':
    'vérifie des données avant d’effacer un emplacement, et ces données échouent à cette vérification : il devrait donc refuser cette écriture avant d’écrire quoi que ce soit (une caméra exécutant ce build a refusé de la même façon une forme antérieure de cette image)',
  'write.ff.runsSlow': 'La caméra exécute le build 8 Hz {version} : {why}. Ce build {outcome}.',
  'write.ff.buildUnknown':
    'Les réponses de la caméra elle-même n’indiquent pas quel build {version} elle exécute : {why}. Si elle exécute le build FF 16 Hz, elle accepte ces données. Si elle exécute le build 8 Hz, ce build {outcome}.',
  'write.raw.asGiven':
    'Données brutes : envoyées exactement telles que fournies. Rien ici ne vérifie qu’elles sont démarrables.',
  'write.raw.ffStagedForm':
    'Ces données sont la forme transférée de 1.3.0.8 FF (l’image XOR le bloc de clés 0, somme des mots 0xFFFF). La caméra stocke l’image sous la clé B : la relecture est donc vérifiée par rapport à ces octets.',
  'write.raw.noStaging':
    'Ce build n’indique aucune forme de transfert pour l’emplacement : les vérifications du bootloader ne peuvent donc pas être établies.',
  'write.raw.reencrypts':
    'L’appareil décode ces données et rechiffre ce qu’il conserve : les octets stockés ne sont donc pas prévisibles. La relecture est vérifiée sous la forme de l’image qu’elle donne une fois déchiffrée, quand c’est possible.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Le bootloader rejetterait ces données : {failure}.',
  'write.raw.stageKeyUnchecked':
    'La clé de transfert de 2016 (bloc de clés 0) n’est pas dans les octets bruts : la somme des mots de ces données une fois déchiffrées n’est donc pas vérifiée ici.',
  'write.image.rekeyRisk':
    '{name:ins} contient déjà une image que le bootloader ne peut pas accepter. Cette écriture aboutit au même état.',
  'write.ack.recovery':
    'Emplacement de secours R : son écriture vous demande d’accepter le risque. Rien ici ne vérifie que la caméra démarre ensuite.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk} : son écriture vous demande d’accepter le risque, et la caméra exécute ce qu’il contient après la prochaine remise sous tension.',
  'write.ack.bootUnnamed':
    'l’emplacement démarré n’a pas pu être identifié : celui-ci est donc traité comme l’emplacement démarré',
  'write.ack.recoveryFallback':
    'L’emplacement de secours R est la copie de dernier recours sur laquelle le bootloader se rabat',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'vierge/0 : emplacement A en priorité, puis B, puis secours',
  'boot.cfg0.modernB': 'emplacement B en priorité, puis A, puis secours',
  'boot.cfg0.modernRecovery': 'secours en priorité, puis A, puis B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'inconnu — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  'upgrade.targetBooted':
    '{name:ins} est à la fois l’emplacement depuis lequel la caméra a démarré et celui qu’écrit sa propre mise à jour. Une mise à jour lancée depuis cette caméra écraserait l’image qu’elle exécute. Ce n’est qu’un avertissement : rien ici n’empêche une mise à jour.',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.targetBooted and upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'La caméra fonctionne sur son emplacement de secours, et sa propre mise à jour écrit {name:acc}, qu’elle n’exécute pas. {verdict} Ce n’est qu’un avertissement : rien ici n’empêche une mise à jour.',
  'upgrade.verdict.notRead':
    '{name:ins} n’a pas pu être lu lors de cette vérification : son contenu est donc inconnu.',
  'upgrade.verdict.blank':
    '{name:ins} est vierge : la mise à jour écrit donc dans un emplacement vide.',
  'upgrade.verdict.bootableSame':
    '{name:ins} contient la même image démarrable que l’emplacement en cours d’exécution, et la mise à jour la remplace. {name:ins} devient impossible à démarrer si la mise à jour s’arrête en cours de route.',
  'upgrade.verdict.bootable':
    '{name} : contient une image démarrable, que la mise à jour remplace. {name} : devient impossible à démarrer si la mise à jour s’arrête en cours de route.',
  'upgrade.verdict.unknown':
    'On ne sait pas lors de cette lecture si {name:acc} est démarrable : la mise à jour risque donc de remplacer une image que la caméra démarrerait.',
  'upgrade.verdict.notBootable':
    '{name:ins} n’apparaît pas comme démarrable lors de cette lecture : la mise à jour ne remplace donc aucune image que la caméra démarrerait.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — l’emplacement où le bootloader est entré à ce démarrage, tel qu’il l’enregistre',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'non lu',
  'report.lastStart.noBank': 'la caméra indique {word}, qui ne désigne aucun emplacement',
  'report.lastStart.entered':
    'la caméra indique être entrée dans {bank:acc} (mot de l’emplacement actif {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'aucune version',
  'running.why.otherVersion': 'la caméra indique {version}, et seul {only} existe en deux builds',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'la caméra n’a pas répondu aux verdicts par emplacement (sélecteurs 6, 7, 8 de GetFirmwareInfo)',
  'running.why.notRead':
    'un emplacement dont dépendent les verdicts n’a pas été lu : les réponses ne peuvent donc pas être prévues',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'la caméra répond {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, ce que répond le build 1.3.0.8 8 Hz pour ces emplacements ({predicted})',
  'running.why.ff':
    '{answers}, ce que répond le build 1.3.0.8 FF 16 Hz pour ces emplacements ({predicted})',
  'running.why.both':
    '{answers}, et les deux builds répondent exactement cela pour ces emplacements : les emplacements ne permettent donc pas de les distinguer',
  'running.why.neither':
    '{answers}, ce qui ne correspond à aucun des deux builds (8 Hz : {plain} ; FF 16 Hz : {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'L’en-tête de cette image n’indique aucune version de firmware : impossible de savoir si c’est le build qu’exécute la caméra ({camera}). Vérifiez que c’est bien l’image que vous voulez écrire.',
  'imageBuild.otherVersion': 'Cette image est le firmware {image} ; la caméra exécute {camera}.',
  'imageBuild.otherVersionTaken':
    'Cette image est le firmware {image} ; la caméra exécute {camera}. Sur cette lignée, la caméra vérifie seulement qu’une image est bien formée (son en-tête et sa somme des mots), pas sa version : elle accepte donc cette image, et quand elle démarre depuis cet emplacement, elle exécute {image}.',
  'imageBuild.otherVersionUnchecked':
    'Cette image est le firmware {image} ; la caméra exécute {camera}. On n’a pas vérifié si cette caméra accepte un autre build, ni si elle l’exécute.',
  'imageBuild.otherBuild':
    'Cette image est le build 8 Hz {version} ; la caméra exécute le build FF 16 Hz {version}. Le build 16 Hz compare des données à sa propre forme FF lors de la validation et refuse celles qui échouent, avant d’effacer l’emplacement (d’après son code source). Écrire le build 8 Hz sur cette caméra n’a pas été essayé sur une caméra.',
  'imageBuild.runningUnknown':
    'Cette image est le build 8 Hz {version}. La caméra exécute {version}, qui existe en build 8 Hz et en build FF 16 Hz, et ses propres réponses n’ont pas dit lequel elle exécute : impossible donc de savoir si c’est son build.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'les données font {size} o, trop peu pour contenir un en-tête à 0x200',
  'bootFail.noMagic':
    'pas de signature d’image à 0x200 (trouvé {found}, le bootloader exige {needs})',
  'bootFail.lengthOutside': 'header.length {length} est en dehors des données de {size} o',
  'bootFail.lengthNotPayload': 'header.length {length} n’est pas la longueur des données {size}',
  'bootFail.overStage': '{size} o dépasse le transfert de {max} o',
  'bootFail.plainSum': 'somme des mots stockée {sum}, le bootloader de 2014 exige 0',
  'bootFail.noFooter': 'pas de pied à {offset} : les données se terminent à {end}',
  'bootFail.footerNotCode':
    'le pied à {offset} n’est pas « CODE » — le bootloader prend son chargeur segmenté',
  'bootFail.footerLength': 'la longueur du pied n’est pas égale à header.length {length}',
  'bootFail.keyASum':
    'déchiffrée sous la clé A de cette caméra, la somme des mots est {sum}, le bootloader exige {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'vérifiée par la somme de contrôle',
  'keyConfidence.structural': 'vérifiée par la table des vecteurs seulement',
  'keyConfidence.unverified': 'non vérifiée',
  /** `{sum}` is hex. */
  'keyCheck.family': 'clé vérifiée par la somme de contrôle {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'clé {phrase} ; somme de contrôle {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'transféré sous les clés propres à la caméra',
  'staging.phrase.slotKeystreamCiphertext': 'transféré sous la clé propre à l’image',
  'staging.phrase.plain': 'transféré en clair',
  'staging.phrase.keyAKeystream':
    'transféré comme l’app du fabricant transfère l’image FF (XOR clé A)',
  'staging.phrase.verbatim': 'envoyé tel que fourni',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    '{size} o validés {name:dat} à {address}, {staged} ; état de validation {status}',
  'written.noReadWindow':
    'ce build n’indique aucune fenêtre de lecture pour l’emplacement : rien n’a donc été relu',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'la relecture a échoué : {error}',
  'written.readBack': '{size} o relus, SHA-256 {sha256}',
  'written.verifyOff': 'la vérification est désactivée : l’emplacement n’a pas été relu',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'les octets que le plan prévoyait dans l’emplacement (l’image telle que le build 16 Hz la stocke, pas les octets envoyés)',
  'readBack.reference.asSent':
    'les octets que le plan prévoyait dans l’emplacement (les octets tels qu’ils ont été envoyés)',
  'readBack.sizeDiffers':
    'la relecture fait {size} o, le plan prévoyait {predictedSize} o : l’emplacement NE correspond PAS à {reference}',
  'readBack.matchesFolded':
    'l’emplacement contient l’image telle que le build 16 Hz la stocke (pas les octets envoyés), et le reste de l’emplacement est effacé',
  'readBack.matches':
    'l’emplacement correspond aux octets prévus par le plan (la chaîne en clair de 2014 programme exactement ce qu’elle reçoit)',
  'readBack.differs': 'l’emplacement NE correspond PAS à {reference} (premier écart à {offset})',
  'readBack.noHeader':
    'la relecture ne contient aucun en-tête d’image à {offset} (signature {magic}) : l’emplacement NE se déchiffre donc PAS en l’image attendue',
  'readBack.lengthDiffers':
    'l’en-tête de la relecture indique {length} o, l’image du plan fait {imageLength} o : l’emplacement NE se déchiffre PAS en l’image attendue',
  'readBack.tooShort':
    'la relecture fait {size} o, trop peu pour une image de {length} o : l’emplacement NE se déchiffre PAS en l’image attendue',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'flux de clé retrouvé à partir de la relecture ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts':
    'l’emplacement se déchiffre en l’image attendue ({length} o) avec le {recovered}',
  'readBack.decryptDiffers':
    'l’emplacement NE se déchiffre PAS en l’image attendue : premier écart au décalage {offset} de l’image, avec le {recovered}',
  'readBack.rawNotCompared':
    'octets bruts : relecture signalée, non comparée (ces octets ne se déchiffrent pas en une image en clair prévisible sous cette forme, et l’appareil rechiffre ce qu’il conserve)',
  'readBack.notCompared':
    'aucune comparaison possible : le plan ne prévoit ni les octets stockés ni l’image en clair',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'clé A',
  'keyName.keyA:acc': 'la clé A',
  'keyName.keyA:gen': 'de la clé A',
  'keyName.keyA:dat': 'à la clé A',
  'keyName.keyA:loc': 'dans la clé A',
  'keyName.keyA:ins': 'La clé A',
  'keyName.keyB': 'clé B',
  'keyName.keyB:acc': 'la clé B',
  'keyName.keyB:gen': 'de la clé B',
  'keyName.keyB:dat': 'à la clé B',
  'keyName.keyB:loc': 'dans la clé B',
  'keyName.keyB:ins': 'La clé B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'clé propre à l’appareil',
  'keyName.perDevice:acc': 'la clé propre à l’appareil',
  'keyName.perDevice:gen': 'de la clé propre à l’appareil',
  'keyName.perDevice:dat': 'à la clé propre à l’appareil',
  'keyName.perDevice:loc': 'dans la clé propre à l’appareil',
  'keyName.perDevice:ins': 'La clé propre à l’appareil',
  'keyName.thePerDevice': 'la clé propre à l’appareil',
  'keyName.thePerDevice:acc': 'la clé propre à l’appareil',
  'keyName.thePerDevice:gen': 'de la clé propre à l’appareil',
  'keyName.thePerDevice:dat': 'à la clé propre à l’appareil',
  'keyName.thePerDevice:loc': 'dans la clé propre à l’appareil',
  'keyName.thePerDevice:ins': 'La clé propre à l’appareil',
  'keyName.applicationKeyA': 'la clé A de l’application',
  'keyName.applicationKeyA:acc': 'la clé A de l’application',
  'keyName.applicationKeyA:gen': 'de la clé A de l’application',
  'keyName.applicationKeyA:dat': 'à la clé A de l’application',
  'keyName.applicationKeyA:loc': 'dans la clé A de l’application',
  'keyName.applicationKeyA:ins': 'La clé A de l’application',
  'keyName.applicationKeyB': 'la clé B de l’application',
  'keyName.applicationKeyB:acc': 'la clé B de l’application',
  'keyName.applicationKeyB:gen': 'de la clé B de l’application',
  'keyName.applicationKeyB:dat': 'à la clé B de l’application',
  'keyName.applicationKeyB:loc': 'dans la clé B de l’application',
  'keyName.applicationKeyB:ins': 'La clé B de l’application',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'bloc de clés 1',
  'keyName.block1:acc': 'le bloc de clés 1',
  'keyName.block1:gen': 'du bloc de clés 1',
  'keyName.block1:dat': 'au bloc de clés 1',
  'keyName.block1:loc': 'dans le bloc de clés 1',
  'keyName.block1:ins': 'Le bloc de clés 1',
  'keyName.theDeviceKey': 'la clé de l’appareil',
  'keyName.theDeviceKey:acc': 'la clé de l’appareil',
  'keyName.theDeviceKey:gen': 'de la clé de l’appareil',
  'keyName.theDeviceKey:dat': 'à la clé de l’appareil',
  'keyName.theDeviceKey:loc': 'dans la clé de l’appareil',
  'keyName.theDeviceKey:ins': 'La clé de l’appareil',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'clé inconnue',
  'keyName.unknown:acc': 'une clé inconnue',
  'keyName.unknown:gen': 'd’une clé inconnue',
  'keyName.unknown:dat': 'à une clé inconnue',
  'keyName.unknown:loc': 'dans une clé inconnue',
  'keyName.unknown:ins': 'Une clé inconnue',
  'keys.noKnownKey': 'aucune clé connue',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'la chaîne en clair de 2014 : chaque emplacement est stocké en clair, aucune clé d’envoi n’est donc dérivée ; l’envoi est l’image telle quelle',
  'keys.evidence.ffVendor':
    'le build 1.3.0.8 FF (16 Hz) : aucun emplacement ouvert par cette lecture n’est stocké en clair, rien ne montre donc que la caméra soit sur la chaîne en clair de 2014 ; l’image FF est écrite sous sa forme fabricant, les octets bruts sont envoyés tels que fournis, et une image 8 Hz en clair n’est pas écrite',
  'keys.evidence.ffUntested':
    'l’écriture de l’image FF est proposée avec son avertissement UNTESTED (non testé) : aucun bootloader authentique de ce build ne figure dans le corpus, on n’a donc pas mesuré si l’emplacement écrit démarre',
  'keys.evidence.line2016':
    'la lignée Compact PRO de 2016 : un envoi est l’image combinée par XOR au flux de clé de son propre bloc de clés 0, trouvé dans l’image par sa valeur ; aucune clé de cette caméra ne sert donc à le construire',
  'keys.evidence.checkKeyUnnamed':
    'la caméra déchiffre l’envoi avec cette clé et le rechiffre sous la clé avec laquelle son bootloader vérifie un emplacement ; cette clé n’a pas été identifiée lors de cette lecture, et l’écriture n’en a pas besoin : l’emplacement est relu sous la forme de l’image qu’il donne une fois déchiffré',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'la caméra déchiffre l’envoi avec cette clé et le rechiffre sous la clé avec laquelle son bootloader vérifie un emplacement ; cette clé n’a pas été identifiée lors de cette lecture ({why}), et l’écriture n’en a pas besoin : l’emplacement est relu sous la forme de l’image qu’il donne une fois déchiffré',
  'keys.evidence.checkKeyNamed':
    'la caméra déchiffre l’envoi avec cette clé et le rechiffre sous {key:acc} {hex}, la clé avec laquelle son bootloader vérifie un emplacement : chaque emplacement qu’elle écrit est donc stocké comme le bootloader l’accepte',
  'keys.evidence.checkKeyInferred':
    'la caméra déchiffre l’envoi avec cette clé et le rechiffre sous {key:acc} {hex}, la clé avec laquelle son bootloader vérifie un emplacement (déduite {bank:gen}, l’emplacement où la caméra indique être entrée, dans lequel le bootloader est entré sans sa vérification) : chaque emplacement qu’elle écrit est donc stocké comme le bootloader l’accepte',
  'keys.evidence.checkKeyNamedFrom':
    'la caméra déchiffre l’envoi avec cette clé et le rechiffre sous {key:acc} {hex}, la clé avec laquelle son bootloader vérifie un emplacement (identifiée à partir {bank:gen}, l’emplacement où la caméra indique être entrée) : chaque emplacement qu’elle écrit est donc stocké comme le bootloader l’accepte',
  /** `{source}` is keys.source.*. */
  'keys.evidence.applicationKeyA':
    'l’application en cours ({bank}, firmware {firmware}) contient sa clé A {keyA} à {keyAAt}, d’après {source}',
  'keys.evidence.applicationKeys':
    'l’application en cours ({bank}, firmware {firmware}) contient sa clé A {keyA} à {keyAAt}, d’après {source}, et sa clé B {keyB} à {keyBAt}',
  'keys.source.keyTable': 'la table des clés du bootloader',
  /** `{builds}`: firmware versions. */
  'keys.source.applicationPair': 'la paire d’application décodée de {builds}',
  'keys.evidence.perDevice':
    'une clé propre à l’appareil est programmée : l’application rechiffre donc sous cette clé',
  'keys.evidence.noPerDevice':
    'aucune clé propre à l’appareil n’est programmée : l’application rechiffre donc sous sa propre clé B',
  'keys.evidence.storeKey':
    'la clé de stockage de l’application est {key:acc} du bootloader ({hex}) : les écritures stockent donc chaque emplacement sous cette clé ; la clé que contient {bank:acc} démarré ({held}) est elle aussi acceptée par le bootloader',
  'keys.evidence.bootedKey':
    '{bank:acc} démarré se déchiffre sous {key:acc} ({hex}), une clé que le bootloader essaie ; la clé de stockage de l’application n’est pas celle du bootloader : les écritures stockent donc chaque emplacement sous la clé de l’emplacement démarré',
  /** `{masks}`: key names joined with commas. */
  'keys.evidence.masks':
    'l’envoi est l’image XOR les flux de clé de {masks:gen} ; l’appareil stocke l’image sous {key:acc}',
  /** `{held}` is a key name or keys.noKnownKey (a sentence, not a name: it takes no case). */
  'keys.evidence.otherBank':
    'la clé sous laquelle {bank:acc} se déchiffre : {held} ; cet emplacement est écrit sous {key:acc} selon la même règle, puis relu pour vérification',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'l’emplacement démarré n’a pas pu être identifié : la clé sous laquelle l’emplacement est stocké ne peut donc pas y être lue',
  'keys.refused.notDerived': 'les clés n’ont pas pu être dérivées',
  'keys.refused.notDecrypted':
    '{bank:acc} démarré ne se déchiffre pas en une image : la clé sous laquelle il est stocké ne peut donc pas être lue',
  'keys.refused.noBootKey':
    '{bank:acc} démarré ne se déchiffre sous aucune clé que le bootloader essaie (sa clé A, ou sa clé de stockage) : la clé sous laquelle l’emplacement est stocké ne peut donc pas y être lue',
  'keys.refused.keyNotInTable':
    '{bank:acc} démarré se déchiffre sous {key:acc}, mais la table des clés de cette caméra ne contient pas cette clé : il ne peut donc pas être écrit sous celle-ci',
  'keys.refused.noApplicationPair':
    'l’application en cours ({bank}, firmware {firmware}) ne contient aucune des paires de clés connues (celle du bootloader et les paires d’application décodées), chaque moitié exactement une fois : sa clé A ne peut donc pas être localisée dans son image',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'l’application en cours ({bank}, firmware {firmware}) ne contient aucune des paires de clés connues (celle du bootloader et les paires d’application décodées), chaque moitié exactement une fois : sa clé A ne peut donc pas être localisée dans son image (la clé A du bootloader apparaît {count} fois, sa clé B {keyB})',
    many: 'l’application en cours ({bank}, firmware {firmware}) ne contient aucune des paires de clés connues (celle du bootloader et les paires d’application décodées), chaque moitié exactement une fois : sa clé A ne peut donc pas être localisée dans son image (la clé A du bootloader apparaît {count} fois, sa clé B {keyB})',
    other:
      'l’application en cours ({bank}, firmware {firmware}) ne contient aucune des paires de clés connues (celle du bootloader et les paires d’application décodées), chaque moitié exactement une fois : sa clé A ne peut donc pas être localisée dans son image (la clé A du bootloader apparaît {count} fois, sa clé B {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'l’application en cours ({bank}, firmware {firmware}) vérifie un envoi sous ses propres clés avant de le programmer (le code source décodé de ce build essaie l’envoi sous sa clé A et sous sa clé de stockage, comme son bootloader essaie un emplacement), et la clé sous laquelle les écritures stockent, {key:acc} ({hex}), n’est ni sa clé A ni sa clé de stockage : la caméra refuserait donc l’envoi avec 0x50000 avant d’effacer quoi que ce soit',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'aucun emplacement ne se déchiffre avec la somme de contrôle {sum} de {family}',
  'writeRefusal.keyTable': 'la table des clés de cette caméra n’a pas pu être confirmée',
  'writeRefusal.whitening':
    'la table des clés de cette caméra se résout avec K={k}, mais {family} chiffre avec K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'les indices disent que cette caméra est {detected}, pas {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'cette caméra ne peut pas être écrite d’ici : {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Les builds Seek de 2018 et après (2.x, 4.x, 10.x, 42.x, 44.x) : Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 et Nano 300. Un dump lit 63 des 64 blocs de la flash sans rien déverrouiller ; aucune lecture n’atteint le bloc à {block} sur ces builds. Le firmware est stocké chiffré. Les emplacements s’écrivent un par un dans l’onglet Emplacements du firmware.',
  'family.summary.early':
    'Les Compact de 2014 antérieures à 0.8.0.0 : 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 et 0.7.0.8. Leur firmware ne sait pas répondre à la lecture qu’envoie un dump : le dump, Extraire tous les sélecteurs, la lecture complète de l’onglet Infos et l’onglet Emplacements du firmware les refusent donc après avoir lu la version ; sur 0.3.0.1, la commande par laquelle commence un dump préparerait au contraire une mise à jour du firmware. La procédure de préservation lit 0.7.0.7 et 0.7.0.8 par une autre commande à laquelle ces deux builds répondent. Un dump fait autrement se déchiffre normalement.',
  'family.summary.compact2016':
    'Les builds Compact PRO 1.0.3.x (1.0.3.0 et 1.0.3.2). Ils répondent aux lectures exactement comme les Compact de 2014, jeton de déverrouillage compris : on les distingue donc par leur version et par la façon dont leurs emplacements sont stockés, chiffrés, alors que ceux de 2014 sont en clair. Une caméra 1.0.3.x est lue sous cette famille dès le départ. La procédure de préservation lit toute la flash, et les emplacements s’écrivent un par un dans l’onglet Emplacements du firmware.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Les Compact de 2014 de 0.8.0.0 à 1.3.0.8, dont le build 1.3.0.8 FF 16 Hz. Une caméra d’origine laisse sortir moins de la moitié de sa flash, une partie seulement contre un jeton de déverrouillage que la boîte à outils envoie ; la procédure de préservation lit le reste grâce à un correctif temporaire. Les emplacements sont stockés en clair, sauf sur le build FF. Une caméra Compact PRO 1.0.3.x est lue comme compact-2016, et ne passe ici que si un emplacement est stocké en clair ou se déchiffre avec {sum}, comme ceux du build FF. Les emplacements s’écrivent dans l’onglet Emplacements du firmware sur les builds où la procédure de préservation a été mesurée ; tout autre build 0.x ou 1.x est seulement lu.',
  'family.summary.generic':
    'Une caméra qu’aucune autre famille ne reconnaît. `seek-fw dump` la lit avec la liste de blocs 4.x (l’onglet 4.x/Nano la refuse), et un déchiffrement calcule la clé à partir de l’image elle-même : ni l’un ni l’autre ne dépend de la supposition. Aucun emplacement n’est écrit : l’onglet Emplacements du firmware la refuse tant que la caméra n’est pas identifiée.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'l’en-tête de l’image indique',
  'detect.source.camera': 'la caméra annonce',
  'detect.plainArmedNotInForce':
    'un BeginFirmwareUpgrade simple de 2 octets a ouvert un emplacement protégé : le canal de lecture authentifié n’est donc pas en vigueur',
  'detect.modern.plainRefused':
    'un BeginFirmwareUpgrade simple de 2 octets sur un emplacement protégé a été REFUSÉ, ce qu’aucun build de cette lignée ne fait — son gestionnaire n’a pas de contrôle de jeton et accepte le canal simple sur chaque emplacement',
  'detect.modern.authArmed':
    'un emplacement protégé s’est ouvert avec le sélecteur authentifié de 18 octets ; rien n’y a essayé le simple, cela ne place donc pas cette caméra hors de cette lignée',
  'detect.modern.legacyVersion':
    '{said} le firmware {version}, qui appartient à la lignée ancienne 0.x / 1.x (une autre numérotation, pas une 4.x plus ancienne — et l’un de ces builds atteint aussi la somme {sum})',
  'detect.modern.noSum':
    'aucun emplacement ne se déchiffre avec la somme de contrôle {sum} qu’exige le bootloader de cette famille',
  'detect.modern.sum': 'un emplacement se déchiffre avec la somme de contrôle {sum}',
  'detect.modern.version':
    'le firmware {version} appartient à la lignée d’après 2018 que couvre cette table de sélecteurs (2.x / 4.x / 10.x / 42.x / 44.x : Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'un BeginFirmwareUpgrade simple de 2 octets a ouvert un emplacement protégé : ce n’est donc pas le firmware ancien verrouillé',
  'detect.modern.none': 'aucun indice ne place cette caméra sur la lignée d’après 2018',
  'detect.early.noVersion':
    'aucune version de firmware n’a été annoncée ni trouvée dans un en-tête d’image',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'le firmware {version} est {first} ou plus récent : sa table RPC a donc un getter pour GetFeaturedFirmwareData, et la voie de lecture ordinaire s’applique',
  'detect.early.older':
    '{said} le firmware {version}, antérieur à {first} — le premier build dont la table des méthodes RPC a un gestionnaire de lecture (getter) pour GetFeaturedFirmwareData',
  'detect.early.noWindow':
    'et aucune fenêtre n’a pu être lue, ce qui est bien la conséquence attendue',
  'detect.generic.fallback':
    'solution de repli : aucune famille de firmware ne correspond avec certitude, les lectures restent donc possibles et les écritures non',
  'detect.compact2016.early':
    'le firmware {version} est antérieur à 0.8.0.0 et n’a pas de gestionnaire de lecture pour GetFeaturedFirmwareData — c’est early-compact, pas cette famille',
  'detect.compact2016.modernSum':
    'un emplacement se déchiffre avec la somme de contrôle {sum}, qui n’est pas la cible de cette génération',
  'detect.compact2016.plainArmed':
    'un BeginFirmwareUpgrade simple de 2 octets a ouvert un emplacement protégé : cette caméra n’est donc pas sur la lignée verrouillée que cette famille partage avec legacy-auth',
  'detect.compact2016.notLine': 'le firmware {version} n’appartient pas à la lignée 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'un emplacement est stocké en clair — le calcul du flux de clé renvoie l’état identité, ses mots stockés SONT donc l’image —, ce qui est la chaîne en clair de 2014 ; les emplacements de cette génération sont en xorshift128 sous une vraie clé',
  'detect.compact2016.keyedZero':
    'un emplacement stocké sous un vrai flux de clé xorshift128 se déchiffre avec la somme de contrôle {sum}, qui est le chiffrement de cette génération',
  'detect.compact2016.zeroSum':
    'un emplacement se déchiffre avec la somme de contrôle {sum}, qui est la cible de cette génération',
  'detect.compact2016.refused':
    'et un emplacement protégé a refusé l’ouverture simple de 2 octets, ce qui est le gestionnaire verrouillé',
  'detect.compact2016.proLine':
    '{said} le firmware {version}, la lignée 1.0.3.x de la Compact PRO de 2016',
  'detect.compact2016.compactLine':
    '{said} le firmware {version}, un build Compact, pas la lignée 1.0.3.x de la Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} le firmware {version}, sur la lignée 0.x / 1.x que cette génération partage avec le firmware ancien verrouillé',
  'detect.compact2016.bootloader2016':
    'le bootloader annonce {version}, un bootloader de la génération 2016 (1.2.0.0 est mesuré sous Compact PRO 1.0.3.0 ; celui de la Compact de 2014 est 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'le bootloader annonce {version}, la numérotation de la génération 2014, pas celle de cette génération',
  'detect.compact2016.none':
    'on n’a vu aucun emplacement se déchiffrer avec une somme de contrôle nulle sous une vraie clé',
  'detect.legacy.proLine':
    'mais le firmware {version} est la lignée 1.0.3.x de la Compact PRO de 2016, dont les emplacements utilisent le chiffrement de compact-2016 : la vérification de cette famille les rejetterait tous',
  'detect.legacy.early':
    'le firmware {version} est antérieur à 0.8.0.0 : sa table RPC n’a pas de gestionnaire de lecture pour GetFeaturedFirmwareData (aucun avant 0.7.0.7, et seulement un setter sur 0.7.0.7 et 0.7.0.8) — c’est early-compact, pas cette famille',
  'detect.legacy.keyedZero':
    'un emplacement stocké sous un vrai flux de clé xorshift128 se déchiffre en {zero} — le chiffrement de la Compact PRO de 2016 (compact-2016). Cette lignée stocke ses emplacements en clair avec une somme des mots de 0 (la chaîne de 2014) ou calée sur {sum} (Compact 1.3.0.8), et sa vérification rejette un tel emplacement',
  'detect.legacy.plainChain':
    'un emplacement est stocké sous forme de firmware en clair dont la somme des mots vaut 0, comme le démarre le bootloader de 2014 de cette lignée',
  'detect.legacy.refused':
    'la caméra a refusé d’ouvrir un emplacement verrouillé pour une mise à jour quand on le lui a demandé sans le déverrouillage, comme seule cette génération de firmware le fait',
  'detect.legacy.unlocked':
    'et elle a ouvert le même emplacement quand on le lui a demandé avec le déverrouillage : le déverrouillage qu’envoie cette famille est donc celui que vérifie cette caméra',
  'detect.legacy.notLine':
    '{said} le firmware {version}, qui n’appartient pas à la lignée ancienne 0.x / 1.x',
  'detect.legacy.authOnly':
    'elle a ouvert un emplacement verrouillé pour une mise à jour quand on le lui a demandé avec le déverrouillage, comme le fait cette génération de firmware ; la demande sans déverrouillage n’a pas été essayée, cela seul ne prouve donc pas la génération',
  'detect.legacy.version':
    'le firmware {version} appartient à la lignée ancienne 0.x / 1.x, une autre numérotation que celle des versions d’application d’après 2018, et pas une 4.x plus ancienne',
  'detect.legacy.none': 'rien d’observé n’indique le canal de lecture authentifié',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{id}`: the table entry's name; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'retenu après un essai sur une caméra : le correctif n’y a pas augmenté la fréquence de publication, et l’obturateur se déclenchait à chaque image après l’écriture',
  'fps.table.predates':
    'le firmware {version} est antérieur à 0.8.0.0 : sa table RPC n’a pas de gestionnaire de lecture pour GetFeaturedFirmwareData, la commande qu’envoie une lecture d’emplacement ; les emplacements ne lisent ni n’écrivent donc aucun emplacement de ce build, et le correctif n’est pas proposé',
  'fps.table.stageTwoFf':
    'stage two : le build FF 16 Hz est transféré comme l’app du fabricant le transfère (l’image XOR la clé A, stockée sous la clé B), pas sous forme d’octets en clair : sa vérification de transfert n’est donc pas faite, et le correctif n’est pas encore proposé',
  'fps.table.stageTwo':
    'stage two : cette entrée ne fait pas partie de l’ensemble stage two : sa vérification de transfert n’est donc pas faite, et le correctif n’est pas encore proposé',
  'fps.table.notOffered': 'non proposé',
  'fps.table.notImage':
    'ce n’est pas une image de firmware : aucun correctif de fréquence d’images ne s’y applique',
  'fps.table.otherBuild':
    'l’image est le build {image} (« {id} »), mais la caméra annonce {camera} ; le correctif est refusé plutôt qu’appliqué à un build auquel il ne correspond pas',
  'fps.table.otherBuildNoVersion':
    'l’image est le build {image} (« {id} »), mais la caméra n’annonce aucune version ; le correctif est refusé plutôt qu’appliqué à un build auquel il ne correspond pas',
  'fps.table.patched':
    'le correctif de fréquence d’images est déjà appliqué : cette image tourne à {hz} Hz',
  'fps.table.earlierPatch':
    'cette image contient un ancien correctif de fréquence d’images {hz} Hz sans la correction USB, et un correctif n’est jamais appliqué à une image déjà corrigée : restaurez l’image d’origine, puis corrigez-la',
  'fps.table.atRate': 'ce build tourne déjà à {hz} Hz sans correctif',
  'fps.table.not4821':
    'cette image annonce le build Compact 4.8.2.1 (ou Compact XR 4.8.2.1, le même build) mais n’est pas l’image d’origine pour laquelle le correctif de fréquence d’images a été écrit (f96ac57eda75 : ses pages de commande de 68 octets, page stable 13) : aucun correctif de fréquence d’images n’est donc fait pour elle',
  'fps.table.notInTable':
    'cette image n’est pas dans la table des correctifs de fréquence d’images : aucun correctif n’est donc fait pour ce build. La table contient les builds Compact 0.7.0.8 à 1.3.0.8 (8 Hz ; 0.7.0.8 est refusé par le code des emplacements), 1.3.0.8 (FF 16 Hz), 4.8.1.7, 4.8.1.9, 4.8.2.1 et 4.16.1.7 FF, ainsi que les builds Compact PRO 1.0.3.x et 4.9.x ; aucun autre build n’y figure',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'le plan de ce build ne comporte pas {bank:acc}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank:ins} ne peut pas recevoir d’image déchiffrée sur ce build : {reason}',
  'fps.plan.empty': '{bank:ins} n’a aucune image déchiffrée à corriger (il est vide)',
  'fps.plan.noImage':
    '{bank:ins} n’a aucune image déchiffrée à corriger (il n’a pas été lu, ou aucune clé ne l’ouvre)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name:ins} a été écrit, mais sa relecture ne diffère pas de l’emplacement enregistré seulement comme prévu : les emplacements suivants n’ont donc pas été écrits',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name} : {error}',

  /* ---- notes: what the read measured about a build, a bank or an empty bank (slots/capability-notes) ----
   * Mode numbers, addresses, version numbers and command names (CompleteMemoryUpgrade, BeginFirmwareUpgrade,
   * EP0, PRESERVATION.md) are names: keep them. `{untested}` is notes.ffBootUntested. */
  /** "This line" is the firmware line (the 2014 0.x/1.x builds, as in notes.token), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.lockedBootWord':
    'L’emplacement démarré indiqué sur cette lignée est celui où la caméra est entrée à son dernier démarrage, tel que l’enregistre le mot de l’emplacement actif (0 emplacement A, 1 emplacement B, 2 emplacement de secours R). Le prochain démarrage est fixé par le mot de configuration de démarrage : 0 ou 0xFFFFFFFF choisissent A en premier, 1 B en premier, toute autre valeur l’emplacement de secours R en premier. L’emplacement de secours R s’exécute chaque fois que A et B ne contiennent rien que le bootloader de 2014 accepte (un emplacement dont la somme des mots vaut 0), quel que soit le contenu de R (mesuré sur une caméra).',
  /** "This line" is the firmware line (the 2016 Compact PRO 1.0.3.x builds), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.locked2016BootWord':
    'L’emplacement démarré indiqué sur cette lignée est celui où la caméra est entrée à son dernier démarrage, tel que le bootloader l’enregistre dans le mot de l’emplacement actif (0 emplacement A, 1 emplacement B, 2 emplacement de secours R). Le prochain démarrage est fixé par le mot de configuration de démarrage : 0 ou 0xFFFFFFFF choisissent A en premier, 1 B en premier, toute autre valeur l’emplacement de secours R en premier. Le bootloader de 2016 n’accepte un emplacement que s’il se déchiffre avec une somme des mots de 0 sous la clé avec laquelle il vérifie un emplacement (le bloc de clés 1 sur son bootloader 1.2.0.0), et le dernier emplacement de cet ordre s’exécute sans vérification quand les deux autres échouent. La lecture identifie cette clé à partir de l’emplacement où la caméra est entrée, car le bloc du bootloader qui la contient est refusé sur tous les canaux (mesuré sur une caméra).',
  'notes.ep0of1032':
    '1.0.3.2 : les sessions EP0 meurent vers 64 à 81 Ko, et 128 o est l’unité de lecture sans perte : un emplacement de 64 Ko par session est donc la limite mesurée. Une lecture complète de la puce est refusée sur ce build (PRESERVATION.md : il n’existe pas de lecture complète en une seule ouverture). L’extraction d’un emplacement lit un emplacement à la fois, par demandes de 64 octets.',
  'notes.token':
    'Les emplacements sont verrouillés sur cette lignée : la caméra n’ouvre un emplacement en écriture que si on le lui demande avec le déverrouillage de la lignée, qui est le même dans les 22 images de firmware connues de cette lignée. Une caméra avec un autre déverrouillage refuse ses emplacements.',
  'notes.staging.lockedPlain':
    'Transfert : l’image elle-même, 56 Ko au plus (le maximum que la caméra accepte en une écriture). L’écriture efface l’emplacement de 64 Ko et écrit exactement ces octets ; le reste de l’emplacement se lit comme effacé. Le bootloader ne démarre un emplacement que si la somme de ses mots vaut 0 : l’image est donc équilibrée à cette somme avant l’envoi.',
  'notes.staging.locked2016':
    'Transfert : l’image, combinée par XOR au flux de clé xorshift128 de son PROPRE bloc de clés 0 (la clé de transfert, trouvée dans l’image par sa valeur), sur la seule longueur de l’image (0xE000 octets au plus). L’appareil déchiffre les données avec cette clé et les stocke sous la clé avec laquelle son bootloader vérifie un emplacement (le bloc de clés 1) : les octets stockés ne sont donc pas ceux transférés. Rien n’est lu dans l’emplacement cible pour le transfert : le flux de clé de l’emplacement ne sert qu’à le relire.',
  'notes.staging.modern':
    'Transfert : l’emplacement entier de 64 Ko, image + remplissage 0xFF + pied « CODE ». L’image est combinée par XOR aux flux de clé qui font que les deux passes propres à l’application en cours la placent sous la clé que contient l’emplacement démarré : quand la commande de validation (CompleteMemoryUpgrade) reçoit le type de données 7, 8 ou 9, l’application déchiffre l’envoi avec sa clé A, le rechiffre sous sa clé de stockage et programme l’emplacement. C’est le pied qui permet au bootloader d’accepter l’emplacement : un emplacement qui n’en a pas est refusé.',
  'notes.modernGap':
    'Sur cette lignée, l’emplacement B est à 0x14050000 (mode 8). Aucun sélecteur n’atteint 0x14060000 sur aucun build 2.x, 4.x, 10.x, 42.x ou 44.x (décodé à partir des 14 images du corpus d’après 2018) : aucun emplacement ne s’y trouve. La disposition à 0x14060000 appartient à la lignée verrouillée 0.x/1.x.',
  'notes.modernNamedWrite':
    'Les écritures nommées (modes 7 à 9) sont décodées à partir du firmware. L’émulateur écrit A, B et R par ce biais sur les builds 4.x et, sur une caméra, l’emplacement A d’une Compact XR 4.8.2.1 a été écrit par le mode 7 par le correctif de fréquence d’images. Une écriture d’emplacement n’ouvre jamais le mode 0, la cible de mise à jour.',
  'notes.unverified':
    'Lecture seule. La disposition des emplacements est la table décodée de la lignée verrouillée, mais aucune forme de transfert n’a été mesurée pour ce build : aucune écriture n’est donc prévue.',
  'notes.empty.plain':
    'Un emplacement vide accepte une image exactement comme un emplacement utilisé. La chaîne en clair transfère les octets de l’image tels quels, sans clé, et la validation efface d’abord le bloc : rien n’est donc lu dans l’emplacement cible. Mesuré sur une Compact : une image écrite dans un emplacement B vide s’est relue à l’identique, et B a démarré seul.',
  'notes.empty.modern':
    'Un emplacement vide accepte une image exactement comme un emplacement utilisé. Les données sont chiffrées sous des clés dérivées de l’emplacement démarré et de l’application en cours, pas de l’emplacement cible, et l’appareil les rechiffre et efface le bloc sans le lire. Le pied est copié d’un emplacement qui en a un valide, sinon il est construit vierge. Prouvé sur l’émulateur ; pas encore mesuré sur une caméra.',
  'notes.empty.locked2016':
    'Un emplacement vide accepte une image exactement comme un emplacement utilisé. La clé de transfert est le bloc de clés 0 de la propre paire de l’IMAGE, pas une clé lue dans l’emplacement cible, et l’appareil déchiffre les données avec elle, les stocke sous sa propre clé et efface le bloc sans le lire. Prouvé sur l’émulateur ; pas encore mesuré sur une caméra.',
  'notes.mode2of080':
    '0.8.0.0 : le mode 2 (0x14000000) risque de planter ce build, une lecture ouverte sort de la SRAM (PRESERVATION.md). Une lecture ou une écriture d’emplacement n’ouvre que les modes 7 à 9, jamais le mode 2.',
  'notes.keyPairs2016':
    'Les builds 9 Hz de 1.0.3.0 et 1.0.3.2 partagent une paire de clés, et les builds FF en partagent une autre. La chaîne de version ne permet pas de les distinguer : le flux de clé est donc retrouvé à partir de l’emplacement lui-même, et c’est l’image propre à l’emplacement qui tranche.',
  'notes.board1030':
    'L’app 1.0.3.0 redémarre sur toute carte autre que celle de la Compact Pro : une carte Compact ne l’exécute donc qu’avec le correctif de carte dans ses emplacements.',
  'notes.bank.modernA':
    'Écrit par une ouverture d’emplacement que la table moderne omet ; une Compact XR 4.8.2.1 a accepté une écriture par ce biais sur une caméra.',
  'notes.bank.recovery2016':
    'Mesuré sur une Compact PRO 1.0.3.0 : l’emplacement de secours R a accepté sa propre image, une modification d’un octet et les octets bruts tels qu’envoyés, chacun écrit sans erreur.',
  'notes.bank.ff1308A':
    'L’image 1.3.0.8 FF (16 Hz) va ici sous la forme dans laquelle l’app du fabricant l’envoie, et la caméra la stocke sous sa propre clé. Le bootloader de 2014 ne démarre un emplacement que si la somme de ses mots vaut 0 : il ignore donc celui-ci au démarrage ; savoir si le build 16 Hz démarre depuis l’emplacement A n’est PAS TESTÉ (UNTESTED). L’image 8 Hz est écrite telle quelle.',
  'notes.bank.ff1308B':
    'L’image 1.3.0.8 FF (16 Hz) va ici sous la forme dans laquelle l’app du fabricant l’envoie, et la caméra la stocke sous sa propre clé. Le bootloader de 2014 ne démarre un emplacement que si la somme de ses mots vaut 0 : il ignore donc celui-ci au démarrage ; savoir si le build 16 Hz démarre depuis l’emplacement B n’est PAS TESTÉ (UNTESTED). L’image 8 Hz est écrite telle quelle.',
  'notes.bank.ff1308R':
    'L’image 1.3.0.8 FF (16 Hz) va ici sous la forme dans laquelle l’app du fabricant l’envoie, et la caméra la stocke sous sa propre clé. Le bootloader 0.9.0.0 démarre l’emplacement de secours R tel qu’il est stocké, sans le décoder : cette forme risque donc de ne pas démarrer — UNTESTED (non testé), et une forme antérieure de cette image a bien démarré depuis cet emplacement (mesuré sur une caméra). L’image 8 Hz est écrite telle quelle.',
  'notes.product.4_8_2_1':
    'Compact 4.8.2.1 et Compact XR 4.8.2.1 (une seule image) : la table moderne de 63 fenêtres ; l’émulateur a confirmé 63 fenêtres sur 63 sur le dump complet de la Compact et sur celui de la Compact XR.',
  'notes.product.10_9_1_31':
    'Mosaic 320x240 10.9.1.31 : la table moderne de 63 fenêtres, chaque fenêtre confirmée par mesure sur l’émulateur.',
  'notes.product.2_27_1_33':
    'Mosaic 320x240 FF 2.27.1.33 : la table moderne de 63 fenêtres, chaque fenêtre confirmée par mesure sur l’émulateur.',
  'notes.product.42_32_3_10':
    'Nano 200 42.32.3.10 : la table moderne de 63 fenêtres, chaque fenêtre confirmée par mesure sur l’émulateur. Sa commande de validation (CompleteMemoryUpgrade) n’a pas de gestionnaire pour le type de données 32, qu’une écriture par le mode 7, 8 ou 9 ne demande jamais.',
  'notes.product.44_27_3_10':
    'Nano 300 44.27.3.10 : la table moderne de 63 fenêtres, chaque fenêtre confirmée par mesure sur l’émulateur. Sa commande d’ouverture (BeginFirmwareUpgrade) refuse un type de données au-delà de la plage qu’elle accepte (0x7F) comme premier argument invalide, et les modes 7 à 9 sont dans cette plage.',
  'notes.ff1308':
    '1.3.0.8-FF (16 Hz) annonce la même version que le build 8 Hz. La lecture les distingue grâce à la caméra : la caméra dit, emplacement par emplacement, si son application accepte l’emplacement, et chaque build prévoit ses propres réponses à partir des emplacements. L’image FF est envoyée sous la forme dans laquelle l’app du fabricant l’envoie, et la caméra la stocke sous sa propre clé. Elle va dans l’emplacement A, l’emplacement B ou l’emplacement de secours R. Le build 8 Hz devrait la refuser avant d’écrire quoi que ce soit ; tant que les réponses de la caméra ne permettent pas de distinguer les builds, le plan indique ce que chaque build en fait. {untested}',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'la caméra n’a pas annoncé sa version de firmware ({note}) ; un numéro de commande n’a pas le même sens sur tous les firmwares Seek — sur la Compact 0.3.0.1, l’identifiant 0x52, celui qui ouvre une fenêtre de lecture, est EnterBootloaderMode — : tant que la version n’est pas connue, rien n’est donc envoyé à part GetErrorCode, GetOperationMode et GetFirmwareInfo, les lectures auxquelles tous les builds répondent de la même façon',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo n’a répondu ({error}) à aucune des {reads} lectures espacées de {spacing} ms, sur une fenêtre de démarrage de {window} ms ; une caméra encore en train de démarrer répond dans ce délai',
  'identity.note.neverTwice':
    'GetFirmwareInfo n’a jamais répondu deux fois de suite en {reads} lectures',
  'identity.note.noAnswer': 'GetFirmwareInfo n’a pas répondu ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo n’a pas répondu ({error}) ; {answered} lectures sur {reads} ont répondu, jamais deux de suite : aucune ne peut donc être distinguée d’un enregistrement qu’une commande précédente aurait laissé sélectionné',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo a répondu {count} octet, trop peu pour une version',
    many: 'GetFirmwareInfo a répondu {count} octets, trop peu pour une version',
    other: 'GetFirmwareInfo a répondu {count} octets, trop peu pour une version',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo a répondu {count} octet, trop peu pour une version ; {context}',
    many: 'GetFirmwareInfo a répondu {count} octets, trop peu pour une version ; {context}',
    other: 'GetFirmwareInfo a répondu {count} octets, trop peu pour une version ; {context}',
  },
  'identity.note.otherRecord':
    'la première lecture a renvoyé un autre enregistrement ({version}), sur lequel une commande précédente avait laissé le sélecteur d’informations firmware — cette lecture l’a remis à zéro',
  'identity.note.afterStartup': {
    one: 'elle a répondu après avoir refusé {count} lecture pendant son démarrage',
    many: 'elle a répondu après avoir refusé {count} lectures pendant son démarrage',
    other: 'elle a répondu après avoir refusé {count} lectures pendant son démarrage',
  },
  'identity.predates':
    'le firmware {version} est antérieur au protocole de dump : sa table des méthodes RPC n’a pas de gestionnaire de lecture pour GetFeaturedFirmwareData (sur 0.7.0.7 et 0.7.0.8, il n’est enregistré que comme setter, et avant cela l’identifiant 0x4F est UploadFirmwareRowSize) : aucune fenêtre ne peut donc être lue avec ; sur 0.3.0.1, l’identifiant 0x52 est EnterBootloaderMode et non BeginFirmwareUpgrade. La procédure de préservation lit 0.7.0.7 et 0.7.0.8 par l’identifiant 0x58 (GetFeaturedData) à la place',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'refus de {operation} : {reason}',
  'identity.refusingNoVersion':
    'refus de {operation} : {reason}. Rien n’a été ouvert. Débranchez la caméra, rebranchez-la, laissez-la finir de démarrer et réessayez.',
  'identity.operation.dump': 'faire le dump',
  'identity.operation.dumpAll': 'extraire tous les sélecteurs',
  'identity.operation.readInfo': 'lire les informations de l’appareil',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'les emplacements se choisissent après la sauvegarde, qui les lit — lancez d’abord la sauvegarde',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'les emplacements ne peuvent plus changer une fois la validation faite ou tentée ; emplacements écrits par cette exécution : {banks} ; la restauration remet exactement ceux-là en état',
  'preserve.banks.none': 'aucun emplacement',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Écrit.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Lue. {count}/{of} emplacements lisibles.',
  'status.readRefused':
    'Lue, mais aucun emplacement de cette caméra ne peut être écrit d’ici — voir le journal.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Version du firmware',
  'compare.field.imageId': 'Id de l’image',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'SP initial',
  'compare.field.resetVector': 'Vecteur de réinitialisation',
  'compare.field.size': 'Taille',
  'compare.field.shaExpected': 'SHA-256 de l’image en clair attendue',
  'compare.field.sha': 'SHA-256 de l’image',
  'compare.field.shaNotStored': 'SHA-256 de l’image en clair attendue (octets stockés non prévus)',
  'compare.field.key': 'Clé',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(aucune image)',
  'compare.notImage': '(pas une image)',
  'compare.notPredicted': '(non prévu : l’appareil décide de ce qu’il stocke)',
  'compare.plaintext': 'aucune (en clair)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'n’a pas pu être lu deux fois de la même façon',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (la clé avec laquelle le bootloader vérifie un emplacement est déduite {bank:gen}, où il est entré sans sa vérification) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered':
    '{bank}, tel que la caméra l’enregistre (mot de l’emplacement actif {word})',
  'preserve.lastStart.notRead': 'inconnu — le mot de l’emplacement actif n’a pas pu être lu',
  'preserve.lastStart.noBank':
    'inconnu — le mot de l’emplacement actif vaut {word}, qui ne désigne aucun emplacement',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'inconnu — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'non écrit — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'une image',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — peut être écrit',
  'preserve.bank.writablePatch': '{build} — peut être écrit ; le correctif modifie {count} octets',
  'preserve.bank.writableEdit': '{build} — peut être écrit ; contient {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — peut être écrit ; le correctif modifie {count} octets ; contient {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'la sauvegarde n’a pas encore lu les emplacements : aucun emplacement ne peut donc être choisi',
  'preserve.choice.every': 'chaque emplacement qui contient une image : {banks}',
  'preserve.choice.everyBlocked':
    'chaque emplacement qui contient une image ne peut pas être écrit : {bank:acc} ne le peut pas — {reason}',
  'preserve.choice.noImage': 'aucun emplacement ne contient d’image que l’exécution puisse écrire',
  'preserve.choice.nextStart': '{bank:acc}, l’emplacement du prochain démarrage : {why}',
  'preserve.choice.nextStartRefused':
    'le prochain démarrage se fait depuis {bank:acc} ({why}), et l’exécution ne peut pas l’écrire : {reason}',
  'preserve.choice.everyUnknownStart':
    'chaque emplacement qui contient une image ({banks}) : on ne sait pas depuis quel emplacement se fera le prochain démarrage ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'on ne sait pas depuis quel emplacement se fera le prochain démarrage ({why}), et {reason} ; choisissez un emplacement par son nom',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} ne peut pas être écrit : {reason}',
  'preserve.choice.byName': '{banks:acc}, l’emplacement choisi par son nom',
  'preserve.choice.warnNotPatched':
    'Le prochain démarrage se fait depuis {bank:acc} ({why}), et ce choix ne le corrige pas : après le redémarrage, la caméra exécute l’image propre à cet emplacement, et la lecture complète s’arrête donc avant de lire quoi que ce soit. La restauration remet quand même en état chaque emplacement écrit.',
  'preserve.choice.warnUnknownStart':
    'On ne sait pas depuis quel emplacement se fera le prochain démarrage ({why}). S’il se fait depuis un emplacement que ce choix ne corrige pas, la lecture complète s’arrête avant de lire quoi que ce soit.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'pas encore connu',
  'preserve.build.firmware': 'firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'tel que la caméra le stocke (cette caméra garde son firmware non chiffré)',
  'preserve.stagedForm.oneKey':
    'sous la forme que stocke la caméra (chiffré sous la clé de la caméra)',
  'preserve.stagedForm.twoKeys':
    'sous la forme que stocke la caméra (chiffré sous les deux clés de la caméra)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'chaque emplacement écrit retrouve exactement les octets que la sauvegarde y a lus',
  'preserve.restoreForm.factoryStaged':
    'chaque emplacement écrit retrouve son firmware d’origine, écrit sous la forme que stocke la caméra : l’emplacement finit octet pour octet tel que la sauvegarde l’a lu',
  'preserve.restoreForm.none':
    'impossible sur ce build : aucune forme du firmware d’origine ne passe la propre vérification de la caméra tout en se stockant de nouveau sous forme des octets d’origine ; l’exécution se termine donc avec l’image complète et le correctif toujours en place',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'impossible sur ce build : le firmware corrigé ne peut pas lire toute la flash, l’exécution n’a donc aucune image complète à fournir',
  'preserve.drain.rotated': 'la caméra la fournit décalée, et l’exécution la remet dans l’ordre',
  'preserve.drain.hazard': 'le correctif évite sur ce build une lecture qui fait planter la caméra',
  'preserve.drain.whole': 'toute la flash de 4 Mo en une seule lecture, {size} octets à la fois',
  'preserve.drain.wholeNotes':
    'toute la flash de 4 Mo en une seule lecture, {size} octets à la fois ; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'permet à la commande de lecture de la caméra d’atteindre toute la flash de 4 Mo, et pas seulement les premiers 64 Ko',
  'preserve.site.countPast':
    'permet à la position de lecture de dépasser 64 Ko, pour qu’une lecture ne revienne pas au début',
  'preserve.site.keepPosition':
    'conserve la position de lecture complète quand elle avance après chaque lecture',
  'preserve.site.savePosition': 'enregistre en entier la position de lecture avancée',
  'preserve.site.clearPosition':
    'remet à zéro toute la position de lecture à chaque début de lecture, pour que la caméra reste lisible après la lecture complète',
  'preserve.site.modeTwoGuard':
    'permet à la lecture complète de démarrer comme toute autre lecture (le firmware d’origine la refuse)',
  'preserve.site.modeTwoIndirection':
    'fait pointer la lecture complète sur le début de la flash (le firmware d’origine la fait pointer sur une valeur qui fait planter la caméra)',
  'preserve.site.armTail':
    'supprime un appel qui fige la caméra quand une lecture démarre sur ce build',
  'preserve.site.other': 'modifie une instruction dont la lecture complète a besoin',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Sauvegarde',
  'preserve.step.patch': 'Correctif',
  'preserve.step.commit': 'Écriture',
  'preserve.step.drain': 'Lecture complète',
  'preserve.step.restore': 'Restauration',
  'preserve.step.verify': 'Vérification',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'l’étape Correctif',
  'preserve.stepId.commit': 'l’étape Écriture',
  'preserve.stepId.drain': 'l’étape Lecture complète',
  'preserve.stepId.restore': 'l’étape Restauration',
  'preserve.stepId.verify': 'l’étape Vérification',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label} : arrêt prévu — la caméra a démarré depuis {bank:acc}, que cette exécution n’a pas corrigé : rien n’a donc été lu.',
  'preserve.result.noReason': 'aucune raison n’a été enregistrée',
  'preserve.result.stopped': '{label} : arrêté — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'aucun emplacement ne contient de firmware que l’exécution puisse corriger',
  'preserve.result.writable.one': '{banks:acc} contient un firmware que l’exécution peut corriger',
  'preserve.result.writable.many':
    '{banks:acc} contiennent un firmware que l’exécution peut corriger',
  'preserve.result.backup':
    '{label} : chaque bloc qu’atteint une lecture normale a été enregistré ; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'un emplacement inconnu',
  'preserve.result.backupNext':
    '{label} : chaque bloc qu’atteint une lecture normale a été enregistré ; {writable} ; prochain démarrage : {next}.',
  'preserve.result.patch': '{label} : préparé pour {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label} : aucun correctif n’a été préparé : aucun emplacement ne contient de firmware que l’exécution puisse corriger.',
  'preserve.result.patchCount':
    '{label} : préparé pour {banks:acc} ; {count} octets changent dans chacun.',
  'preserve.result.commitOne':
    '{label} : {banks:acc} écrit avec le correctif, et la caméra l’a accepté.',
  'preserve.result.commitMany':
    '{label} : {banks:acc} écrits avec le correctif, et la caméra a accepté chacun d’eux.',
  'preserve.result.drainNotRead': '{label} : non lue.',
  'preserve.result.drain':
    '{label} : toute la flash de 4 Mo a été lue ; l’image complète a pour sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label} : toute la flash de 4 Mo a été lue par {bank:acc} ; l’image complète a pour sha256 {sha256}.',
  'preserve.result.restore': '{label} : réécriture terminée pour {banks:acc}.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label} : réécriture terminée pour {banks:acc}, {form}.',
  'preserve.result.verifyDone': '{label} : terminé.',
  'preserve.result.verifyIdentical':
    '{label} : {blocks} blocs relus, 0 octet différent — la mémoire flash de la caméra est identique octet pour octet à la sauvegarde.',
  'preserve.result.verifyDiffers': '{label} : {blocks} blocs relus, {bytes} octets différents.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label} : {blocks} blocs relus, {bytes} octets différents, {count} bloc illisible.',
    many: '{label} : {blocks} blocs relus, {bytes} octets différents, {count} blocs illisibles.',
    other: '{label} : {blocks} blocs relus, {bytes} octets différents, {count} blocs illisibles.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Arrêté avant la lecture complète : la caméra a démarré depuis un emplacement que cette exécution n’a pas corrigé, rien n’a donc été lu.',
  'preserve.unpatchedStart.next':
    'Ensuite : la restauration remet en état chaque emplacement écrit. La lecture complète n’est pas retentée : la caméra démarrerait depuis le même emplacement.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Terminé — votre firmware est préservé',
  'preserve.done.detail':
    'L’image complète est toute la mémoire flash d’origine de la caméra, et la caméra elle-même est revenue exactement à son état d’avant.',
  'preserve.done.titleNoImage':
    'Terminé — la caméra est revenue à son état d’avant ; il n’y a pas d’image complète',
  'preserve.done.detailNoImage':
    'La lecture complète n’a pas eu lieu : cette exécution n’a donc pas d’image complète de la flash. Chaque emplacement écrit a été remis en état, et une nouvelle lecture des blocs qu’atteint un dump normal correspond à la sauvegarde. Pour avoir l’image complète, lancez une nouvelle exécution avec un choix qui inclut l’emplacement du prochain démarrage.',
  'preserve.done.detailNoImageCount':
    'La lecture complète n’a pas eu lieu : cette exécution n’a donc pas d’image complète de la flash. Chaque emplacement écrit a été remis en état, et une nouvelle lecture des {blocks} blocs qu’atteint un dump normal correspond à la sauvegarde. Pour avoir l’image complète, lancez une nouvelle exécution avec un choix qui inclut l’emplacement du prochain démarrage.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'le lecteur de fenêtres de la caméra a un budget par démarrage, et ces lectures viennent d’un lecteur épuisé — éteignez puis rallumez la caméra (débranchez-la et rebranchez-la, ou utilisez son interrupteur), puis relancez `preserve --resume <run-directory>`. Signature : {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'le lecteur de fenêtres de la caméra a un budget par démarrage, et ces lectures viennent d’un lecteur épuisé — éteignez puis rallumez la caméra (débranchez-la et rebranchez-la, ou utilisez son interrupteur), puis relancez `preserve --resume <run-directory>`. Signature : {signature} — aucun texte clair d’usine ne peut être dérivé de ces octets. Toutes les façons de le lire ont été essayées :\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'la sauvegarde ne contient pas {bank:acc} ({address}) — les fenêtres d’origine ne peuvent pas le fournir',
  'preserve.fail.readsDisagree':
    'les deux lectures {bank:gen} ne concordent pas (sha256 {sha256} contre {other}) — une caméra incapable de fournir deux fois de suite l’emplacement qu’elle exécute n’est pas une caméra dans laquelle écrire ; la capture est la source de la restauration et la base du calcul du correctif',
  'preserve.fail.notFactory':
    '{bank:ins} ne contient pas l’image d’usine telle que le chiffrement de ce build la stocke (le début attendu de l’image ne correspond pas à la capture) — refus avant tout enregistrement, et à plus forte raison avant toute écriture',
  'preserve.fail.ffSum':
    'le firmware corrigé, sous la forme que stocke la caméra, ne passe pas la propre vérification de ce build (sa somme doit être {sum}) — refus d’envoyer un emplacement que la caméra rejetterait après l’effacement',
  'preserve.fail.headChanged':
    'le début {bank:gen} a changé depuis la sauvegarde (il ne contient ni la capture d’origine ni les octets corrigés) — refus d’écrire sur un emplacement dans un état inconnu ; rien n’a été écrit. Début en hex : actuel {live} contre capture {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks:ins} contient déjà les octets corrigés — la validation a abouti lors d’une tentative précédente et ne doit pas être rejouée. Reprenez à l’étape de lecture complète (--resume), qui démarre l’image corrigée et continue à partir de là.',
  'preserve.fail.landed':
    'Ces emplacements contiennent déjà les octets corrigés : {banks:acc} — la validation a abouti lors d’une tentative précédente et ne doit pas être rejouée. Reprenez à l’étape de lecture complète (--resume), qui démarre l’image corrigée et continue à partir de là.',
  'preserve.fail.drainRebootRefused':
    'la commande de redémarrage de la lecture complète a été REFUSÉE par l’hôte avant de partir (une SecurityError : une règle du navigateur ou une protection de test) : la caméra exécute donc toujours l’image avec laquelle elle a démarré, pas le correctif validé. La lecture complète ne lit que par la fenêtre élargie de l’image corrigée : elle s’arrête donc avant d’ouvrir quoi que ce soit ; rien n’a été lu. Relancez la lecture complète là où l’hôte laisse passer la commande de redémarrage.',
  'preserve.fail.shiftedRebootRefused':
    'la lecture complète est revenue décalée d’une page, et le redémarrage qui permet un autre démarrage a été REFUSÉ par l’hôte avant de partir (une SecurityError : une règle du navigateur ou une protection de test) — une autre tentative lirait le même démarrage décalé. Rien n’a été conservé ; relancez la lecture complète là où la réinitialisation peut partir.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'la vérification a lu {count} octet différent sur {read}/{total} fenêtres — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
    many: 'la vérification a lu {count} octets différents sur {read}/{total} fenêtres — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
    other:
      'la vérification a lu {count} octets différents sur {read}/{total} fenêtres — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
  },
  'preserve.fail.verifyIn': {
    one: 'la vérification a lu {count} octet différent sur {read}/{total} fenêtres (dans {places}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
    many: 'la vérification a lu {count} octets différents sur {read}/{total} fenêtres (dans {places}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
    other:
      'la vérification a lu {count} octets différents sur {read}/{total} fenêtres (dans {places}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
  },
  'preserve.fail.verifyShort': {
    one: 'la vérification a lu {count} octet différent sur {read}/{total} fenêtres (fenêtres courtes : {short}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
    many: 'la vérification a lu {count} octets différents sur {read}/{total} fenêtres (fenêtres courtes : {short}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
    other:
      'la vérification a lu {count} octets différents sur {read}/{total} fenêtres (fenêtres courtes : {short}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
  },
  'preserve.fail.verifyInShort': {
    one: 'la vérification a lu {count} octet différent sur {read}/{total} fenêtres (dans {places}) (fenêtres courtes : {short}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
    many: 'la vérification a lu {count} octets différents sur {read}/{total} fenêtres (dans {places}) (fenêtres courtes : {short}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
    other:
      'la vérification a lu {count} octets différents sur {read}/{total} fenêtres (dans {places}) (fenêtres courtes : {short}) — la puce ne se relit pas à l’identique, octet pour octet, de la sauvegarde',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'le bloc de configuration de démarrage',
  'preserve.fail.dataBlock': 'un bloc de données',

  'preserve.refused.secondRead': 'sa seconde lecture a échoué ({error})',
  'preserve.refused.readsDisagree':
    'ses deux lectures ne concordent pas (sha256 {sha256} contre {other})',
  'preserve.refused.erased': 'il est effacé',
  'preserve.refused.watchdogMark':
    'son mot d’en-tête à +0x200 contient {word}, la marque que le bootloader écrit sur un emplacement après une réinitialisation par le watchdog au début d’un démarrage ; le bootloader n’accepte plus cet emplacement, et l’exécution n’a aucune image à y corriger',
  'preserve.refused.noHeader': 'il ne contient aucun en-tête d’image à +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'il contient {image} ({id}), pas le build qu’exécute la caméra ({camera})',
  'preserve.refused.otherKey':
    'la vérification du bootloader le refuse : il est stocké sous une autre clé que celle avec laquelle le bootloader de cette caméra vérifie les emplacements, et une écriture par la caméra le stockerait sous cette clé : la restauration ne pourrait donc pas remettre ses octets exacts',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'la caméra annonce le firmware {camera}, attendu {version} — le correctif est dérivé des octets d’un build et ne doit pas être envoyé à un autre',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'le firmware {version} n’est pas un build 0.x ou 1.x, et cette exécution ne couvre que les builds de 2014 et 2016. Rien n’a été lu au-delà de la version. Lisez plutôt cette caméra avec Extraire et déchiffrer pour 4.x et Nano : il lit la flash sans correctif, chaque bloc sauf celui à 0x14060000, qu’aucune fenêtre de lecture n’atteint sur ces builds.',
  'preserve.refused.preWidening':
    'le firmware {version} est antérieur à la voie d’élargissement, et l’exécution refuse plutôt que d’écrire sur un emplacement qu’elle ne peut pas relire. Sur cette génération, la caméra rejette toutes les façons de lancer la lecture dont la voie a besoin (mesuré sur 0.3.0.1), sa commande de lecture n’atteint pas le début de la flash, et la taille que le correctif modifierait est stockée autrement. Elle n’a pas non plus de lecture utilisable par un dump standard. Rien n’a été lu au-delà de la version.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'contient une image inconnue (ni le firmware {version} d’origine, ni une modification de celui-ci que Preserve connaît) : Preserve ne le corrige donc pas et ne le remet pas en état',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'contient un build connu à fréquence d’images modifiée : le firmware {version} d’origine avec le correctif de fréquence d’images {hz} Hz. Preserve ne corrige que le firmware d’origine, jamais une image déjà corrigée : il ne corrige donc pas cet emplacement et ne le remet pas en état',
  'preserve.image.frameRateEarlier':
    'contient un build connu à fréquence d’images modifiée : le firmware {version} d’origine avec un ancien correctif de fréquence d’images {hz} Hz (fait avant l’ajout de la correction USB). Preserve ne corrige que le firmware d’origine, jamais une image déjà corrigée : il ne corrige donc pas cet emplacement et ne le remet pas en état',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'il {what}. Pour inclure cet emplacement, réécrivez-y d’abord l’image d’origine (par exemple à partir d’une sauvegarde complète de la flash faite avant la modification), puis lancez une nouvelle exécution',
  'preserve.image.frameRateWords':
    'il {what}. Pour inclure cet emplacement, réécrivez-y d’abord l’image d’origine (par exemple à partir d’une sauvegarde complète de la flash faite avant le correctif de fréquence d’images), puis lancez une nouvelle exécution ; le correctif de fréquence d’images pourra ensuite être refait sur l’image d’origine',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name:ins} {what}. L’exécution prend dans cet emplacement le firmware qu’elle corrige : elle s’arrête donc ici, avant toute écriture. Pour préserver cette caméra, réécrivez d’abord l’image d’origine {bank:loc} (par exemple à partir d’une sauvegarde complète de la flash faite avant la modification), puis lancez une nouvelle exécution.',
  'preserve.image.frameRateRefusal':
    '{name:ins} {what}. L’exécution prend dans cet emplacement le firmware qu’elle corrige : elle s’arrête donc ici, avant toute écriture. Pour préserver cette caméra, réécrivez d’abord l’image d’origine {bank:loc} (par exemple à partir d’une sauvegarde complète de la flash faite avant le correctif de fréquence d’images), puis lancez une nouvelle exécution ; le correctif de fréquence d’images pourra ensuite être refait sur l’image d’origine.',
  'preserve.image.otherFirmware':
    'il contient le firmware {image}, pas le {camera} qu’exécute la caméra',
  'preserve.image.otherFirmwareRefusal':
    '{name:ins} contient le firmware {image}, pas le {camera} qu’exécute la caméra : cette exécution n’a donc aucune image qu’elle puisse y corriger, et refuse plutôt que d’écrire par-dessus.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'aucune image que l’exécution puisse corriger n’en est dérivée ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** `{step}`, `{next}`, `{steps}`: the run's step ids (backup, patch, commit, drain, restore, verify), as the CLI names them: keep them. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone':
    'cette exécution est terminée — toutes les étapes sont faites (exécution {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} est déjà faite dans cette exécution (terminée le {finished}) — la reprise continue à {next}',
  'preserve.gate.stepDoneUnknownTime':
    '{step} est déjà faite dans cette exécution (terminée à une heure inconnue) — la reprise continue à {next}',
  'preserve.gate.backupRerun':
    'la sauvegarde ne peut pas être relancée : cette exécution a déjà terminé {steps} et son étape suivante est {next} — utilisez --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'la tentative de sauvegarde précédente a échoué, et la caméra doit être ÉTEINTE PUIS RALLUMÉE avant que cette étape ne soit relancée — un nouvel essai sur le même démarrage peut lire des octets périmés ou vides (mesuré : une sauvegarde relancée a lu le mot de démarrage du bootloader à la place de l’enregistrement de configuration de démarrage). Éteignez puis rallumez la caméra (débranchez-la et rebranchez-la, ou utilisez son interrupteur), puis relancez la sauvegarde et confirmez la remise sous tension quand on vous le demande : l’exécution ne peut pas la constater elle-même. L’échec enregistré : {error}',
  'preserve.gate.noErrorText': '(aucun texte d’erreur)',
  'preserve.gate.patchAfterBackup':
    '{step} s’exécute après la sauvegarde : l’exécution fait le dump de chaque zone que le plan d’origine peut lire et l’enregistre AVANT toute autre chose — cette sauvegarde est la seule copie de cette caméra. Lancez d’abord l’étape de sauvegarde.',
  'preserve.gate.commitAfterBackup':
    '{step} s’exécute après la sauvegarde (voir l’étape du correctif)',
  'preserve.gate.commitAfterPatch':
    '{step} s’exécute après l’étape du correctif, qui enregistre ce qu’elle transfère',
  'preserve.gate.commitNeedsPatch':
    '{step} a besoin du correctif {banks:gen}, et l’étape du correctif n’en a enregistré aucun — relancez l’étape du correctif',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} exige les fichiers de sauvegarde dans le dossier de l’exécution, et ils manquent : {files} — sans eux, une validation n’a aucune source de restauration : elle refuse donc',
  'preserve.gate.drainNoCommit':
    '{step} lit la puce CORRIGÉE par la fenêtre élargie, et cette exécution n’a aucune validation terminée — la lecture complète bloquerait sur une caméra d’origine. Lancez d’abord la validation (ou reprenez-y), ou sautez-la explicitement (allowJump) si la validation a abouti sans son point de contrôle.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'l’étape de lecture complète est refusée sur {build} : {note}',
  'preserve.gate.detectedBuild': 'le build détecté',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'l’étape de lecture complète est refusée sur {build} : lancer la lecture complète sur le firmware non corrigé de ce build fait planter la caméra (il lit à partir d’une valeur qui n’est pas une adresse de la flash ; mesuré sur l’émulateur : 32 Ko fournis, puis la caméra a planté). La modification qui rend la lecture sûre se trouve à {sites}, et elle ne fait pas partie des modifications que cette exécution a enregistrées pour {bank:acc} — lancez l’étape du correctif (et menez l’écriture à bien) avant la lecture complète.',
  'preserve.gate.drainFiles':
    '{step} a besoin de {files} (le dump fourni est complété avec la capture de chaque emplacement écrit), et ce fichier n’est pas dans le dossier de l’exécution',
  'preserve.gate.restoreNoCommit':
    '{step} remet les emplacements d’origine par-dessus le correctif, et cette exécution n’a aucune validation terminée — il n’y a rien à annuler. Lancez d’abord la validation (ou reprenez-y), ou sautez-la explicitement (allowJump) pour restaurer une caméra déjà corrigée.',
  'preserve.gate.restoreNeedsPatch':
    '{step} a besoin du résumé du correctif de chaque emplacement écrit (pour la longueur transférée) — lancez d’abord l’étape du correctif',
  'preserve.gate.restoreNoForm':
    'l’étape de restauration est refusée sur {build} : aucune forme du firmware d’origine ne passe la propre vérification de la caméra tout en se stockant de nouveau sous forme des octets d’origine — la somme de contrôle du firmware d’origine est 0xB7AB9D17 (mesuré), pas le 0xFFFF qu’exige la caméra. Cette exécution se termine avec l’image complète en main et le correctif en place ; le contenu d’origine ne peut être remis qu’avec un programmateur de flash complet.',
  'preserve.gate.restoreFiles':
    '{step} a besoin de {files} (l’original de chaque emplacement écrit, issu de l’étape de sauvegarde), et ce fichier n’est pas dans le dossier de l’exécution',
  'preserve.gate.verifyNoRestore':
    '{step} compare un démarrage à neuf avec la sauvegarde, et cette exécution n’a aucune restauration terminée — un emplacement corrigé apparaîtrait comme des différences. Lancez d’abord la restauration (ou reprenez-y), ou sautez-la explicitement (allowJump) si la restauration a abouti sans son point de contrôle.',
  'preserve.gate.verifyNeedsBackup':
    '{step} a besoin de {file} (la référence de la comparaison), et ce fichier n’est pas dans le dossier de l’exécution',
  'preserve.gate.needsBanks':
    '{step} a besoin des emplacements que l’étape de sauvegarde a lus, et l’état n’en contient aucun',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'aucun emplacement n’est choisi pour cette exécution : {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank:ins} ne peut pas être écrit : {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'le correctif de ce build ne démarre que depuis l’emplacement de secours R : {note} — l’exécution écrirait {bank:acc}, que le bootloader n’exécute jamais',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'le fichier est trop petit pour contenir un en-tête d’image',
  'slots.image.notWordSized': 'la taille de l’image doit être un multiple de 4 (reçu {size} o)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'l’image fait {size} o ; le bootloader rejette tout header.length >= {limit}, elle ne démarrerait donc jamais',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'pas d’en-tête d’image à {at} (signature {magic}, attendu {expected}) — il faut une image de firmware Seek déchiffrée, pas un emplacement chiffré ni un dump de la flash',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'le pointeur de pile initial {address} n’est pas dans la SRAM du LPC43xx — cela ne semble pas déchiffré',
  'slots.image.stackUnaligned': 'le pointeur de pile initial {address} n’est pas aligné sur un mot',
  'slots.image.notThumb': 'le vecteur de réinitialisation {address} n’est pas une adresse Thumb',
  'slots.image.noKeyPair':
    'le nom de ce fichier ne contient pas sa paire de clés, et ni la paire de cette caméra ni une paire d’application décodée n’apparaît exactement une fois dans l’image : impossible donc de savoir pour quelles clés l’image a été construite. Les fichiers déchiffrés sortent nommés d’après les clés qu’ils contiennent.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'le nom de fichier annonce la clé A {keyA} et la clé B {keyB}, mais {mismatch}. Les deux clés doivent être présentes, exactement une fois chacune.',
  'slots.image.keyInHeader':
    'cette image garde une clé à {at}, dans la fenêtre d’en-tête en clair — refus de la corriger',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'la clé A et la clé B du nom de fichier se chevauchent à {at} et {other} — ce doivent être deux valeurs distinctes de 16 octets',
  'slots.image.retargetLost':
    'après adaptation, l’image ne contient pas exactement une fois la paire de clés de cette caméra — refus de construire des données dont le bootloader ne saurait pas trouver la clé lors des mises à jour suivantes',
  'slots.image.noStageKey':
    'l’image ne contient aucune paire de clés de la lignée 2016 : il n’y a donc aucune clé de transfert pour l’encoder',
  'slots.image.ffSumNoKeys':
    'cette image a la somme des mots 0xFFFF du FF 16 Hz mais ne contient pas la paire de clés 1.3.0.8-FF (les deux moitiés, une fois chacune) : sa forme transférée ne peut donc pas être construite. Rien n’a été écrit.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'c’est l’image 1.3.0.8 FF (16 Hz), qui est transférée sous sa propre forme clé A (ff-form.ts), pas comme une image en clair. Rien n’a été écrit.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'le plan a été établi pour le firmware {firmware}, mais l’analyse lit {version}. Le plan est périmé ; établissez-le de nouveau. Rien n’a été écrit.',
  'slots.plan.otherFirmwareUnknown':
    'le plan a été établi pour un firmware de version inconnue, mais l’analyse lit {version}. Le plan est périmé ; établissez-le de nouveau. Rien n’a été écrit.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'le plan a été établi pour la caméra {planSerial}, mais l’analyse lit {serial}. Refus de l’écrire ici. Rien n’a été écrit.',
  'slots.plan.cameraUnknownSerial': 'de numéro de série inconnu',
  'slots.plan.unknownSerial': 'un numéro de série inconnu',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'le plan vise {address}, mais {name:acc} du build est à {at}',
  'slots.plan.notRead': 'l’analyse ne lit plus {name:acc}. Rien n’a été écrit.',
  'slots.plan.edited':
    'la somme de contrôle du plan ne correspond pas à ses données : le plan a donc été modifié. Rien n’a été écrit.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'les données font {size} o, plus que {name:acc}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. L’écrire exige acknowledgeRisk: true. Rien n’a été envoyé.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'cette caméra ne peut pas recevoir d’ici une image transférée en clair : {reason}. Rien n’a été écrit.',
  'slots.plan.noKeyTable':
    'l’analyse n’identifie pas la table des clés du bootloader de cette caméra : l’image ne peut donc pas y être adaptée',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'l’état de la validation n’a pas pu être lu après CompleteMemoryUpgrade : {name:acc} est donc peut-être partiellement écrit. Relisez les emplacements avant toute autre chose, et gardez votre dump.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'la caméra a refusé l’écriture {name:gen} à la validation avec {status} : {cause}. Rien n’a été écrit ; l’emplacement est inchangé. Relisez les emplacements avant toute autre chose.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade a renvoyé {status} ({cause}) pour {name:acc} : rien n’a été programmé, mais l’effacement a pu commencer : l’emplacement est donc peut-être partiellement effacé. Relisez les emplacements avant toute autre chose, et gardez votre dump.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade a renvoyé {status} ({cause}) — {name:acc} est peut-être partiellement écrit. Relisez les emplacements avant toute autre chose, et gardez votre dump.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'la caméra a signalé {status} pendant le transfert {name:gen} au décalage {offset} — abandon avant CompleteMemoryUpgrade : rien n’a donc été écrit dans la flash',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum':
    'la somme de contrôle du transfert ne correspondait pas aux octets transférés',
  'commit.cause.unsupported':
    'l’image ne s’est pas déchiffrée sous les clés de la caméra, ou le type de données est refusé',
  'commit.cause.acceptance':
    'l’image a été refusée par sa vérification d’acceptation avant tout effacement (la vérification dépend du build)',
  'commit.cause.notArmed': 'aucune mise à jour d’emplacement n’était ouverte',
  'commit.cause.eraseFailed': 'l’étape d’effacement a échoué',
  'commit.cause.programFailed': 'l’étape de programmation a échoué',
  'commit.cause.verifyFailed': 'l’étape de vérification a échoué',
  'commit.cause.unknown': 'un état inconnu ici',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name:ins} n’est pas copié sur lui-même. Rien n’a été écrit.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Rien n’a été écrit.',
  'copy.refused.noPlain': '{name:ins} n’a aucune image déchiffrée à copier. Rien n’a été écrit.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} est un ZIP qui ne peut pas être lu ici ({error}). Rien n’a été écrit.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} ne contient pas de flash complète. Un ZIP est accepté s’il s’agit d’un fichier d’exécution Preserve qui contient {preserve} (une fois son étape de dump complet faite), d’un zip de « Extraire et déchiffrer 4.x/Nano » ({dump}) ou d’un zip de « Extraire tous les sélecteurs » ({selectors}) ; ce ZIP contient {names}. Rien n’a été écrit.',
  'restore.refused.noWholeFlashPatched':
    '{file} ne contient pas de flash complète. Un ZIP est accepté s’il s’agit d’un fichier d’exécution Preserve qui contient {preserve} (une fois son étape de dump complet faite), d’un zip de « Extraire et déchiffrer 4.x/Nano » ({dump}) ou d’un zip de « Extraire tous les sélecteurs » ({selectors}) ; ce ZIP contient {names}. Son {patched} est la flash avec le correctif temporaire de l’exécution : il n’est donc pas accepté. Rien n’a été écrit.',
  'restore.refused.zipEmpty': 'rien',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'une sauvegarde complète de la flash fait {full} o (4 Mo, toute la puce que lit un J-Link) ; {file} fait {size} o. Rien n’a été écrit.',
  'restore.refused.noBank': 'le plan de ce build ne comporte pas {bank:acc}. Rien n’a été écrit.',
  'restore.refused.outsideFlash':
    '{name:ins} n’est pas à l’intérieur d’une flash de 4 Mo. Rien n’a été écrit.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} n’a pas été lu par le dump dont provient {file} : d’après son manifest.json, {address} est un trou. Il n’y a aucune image à restaurer. Rien n’a été écrit.',
  'restore.refused.gapReason':
    '{where} n’a pas été lu par le dump dont provient {file} : d’après son manifest.json, {address} est un trou ({gap}). Il n’y a aucune image à restaurer. Rien n’a été écrit.',
  'restore.refused.gapFill':
    '{where} n’a pas été lu par le dump dont provient {file} : d’après son manifest.json, {address} est un trou, rempli avec {fill}. Il n’y a aucune image à restaurer. Rien n’a été écrit.',
  'restore.refused.gapReasonFill':
    '{where} n’a pas été lu par le dump dont provient {file} : d’après son manifest.json, {address} est un trou ({gap}), rempli avec {fill}. Il n’y a aucune image à restaurer. Rien n’a été écrit.',
  'restore.refused.empty':
    '{where} est vide : chaque octet vaut 0xFF. Une écriture programme une image et ne peut pas laisser un emplacement effacé : un emplacement vide ne peut donc pas être restauré par une écriture. Rien n’a été écrit.',
  'restore.refused.fill':
    '{where} vaut {fill} sur chaque octet, le remplissage que le dump écrit là où il n’a rien lu : le dump n’a pas lu cet emplacement. Il n’y a aucune image à restaurer. Rien n’a été écrit.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} ne peut pas être restauré à partir de ce fichier : {why}. Rien n’a été écrit.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'ce build n’a aucune ouverture en écriture pour cet emplacement',
  'support.noStagingEmpty':
    'ce build n’a aucune forme de transfert : un emplacement vide n’est donc pas écrit',
  'support.buildUnknown': 'le build est inconnu',
  'support.unverifiedStaging':
    'ce build est sur la lignée verrouillée 0.x/1.x mais ne fait pas partie des builds sur lesquels les tables de correctifs de préservation ont été mesurées (0.8.0.0 .. 1.3.0.8 et 1.0.3.0 / 1.0.3.2) : la forme de transfert de ses emplacements est donc inconnue, et rien n’est écrit',
  'support.unknownFamily':
    'la famille de la caméra est inconnue, donc aussi la clé sous laquelle ses emplacements sont écrits ; or une caméra accepte un emplacement écrit sous une mauvaise clé, puis ne démarre plus depuis celui-ci. Faites le dump de cette caméra et déchiffrez-le, identifiez-la à partir du dump, puis indiquez sa famille avec --family.',
  'support.noReadCommand':
    'les firmwares antérieurs à 0.8.0.0 n’ont pas de gestionnaire de lecture pour GetFeaturedFirmwareData, la commande avec laquelle un dump lit la flash. Sur 0.7.0.7 et 0.7.0.8, elle figure dans la table des méthodes RPC à 0x4F, mais n’est enregistrée que comme setter (gestionnaire d’écriture) : la lecture control-IN qu’envoie un dump ne peut donc pas être traitée (la procédure de préservation lit ces deux builds par l’identifiant 0x58, GetFeaturedData, à la place) ; avant 0.7.0.7, l’identifiant 0x4F est UploadFirmwareRowSize, et sur 0.3.0.1 l’identifiant 0x52 — celui avec lequel un dump ouvre une fenêtre — est EnterBootloaderMode et non BeginFirmwareUpgrade : la caméra reste dans son application, mais chaque ouverture fixe une cible dans la flash et prépare l’étape de mise à jour du firmware de ce build (GetErrorCode lit alors 0x00400000), ce qui n’est pas une fenêtre de lecture. Retrouvé à partir des tables de méthodes des images elles-mêmes, les deux colonnes de gestionnaires ; voir test/firmware/facts.json.',
  'support.noWritePath':
    'ces builds reçoivent un nouveau firmware par une ancienne séquence de mise à jour que cette boîte à outils n’envoie pas, et leurs emplacements n’ont jamais été cartographiés : rien n’est donc écrit.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'la version du firmware n’a pas pu être lue : le build, ses emplacements et leur forme de transfert sont donc inconnus ; rien n’y est lu ni écrit',
  'support.versionNotDotted':
    'la version du firmware « {version} » n’est pas une version à points : le build, ses emplacements et leur forme de transfert sont donc inconnus ; rien n’y est lu ni écrit',
  'support.olderThanFirst':
    'le firmware {version} est antérieur à {first} : sa table RPC n’a pas de gestionnaire de lecture pour GetFeaturedFirmwareData, la commande qu’envoie une lecture d’emplacement ; ni lecture ni écriture ne lui est donc envoyée (early-compact contient les indices)',
  'support.modernOnLocked':
    'la famille modern-4x couvre 2.x, 4.x, 10.x, 42.x et 44.x ; {version} est sur la lignée verrouillée 0.x / 1.x, qui demande legacy-auth ou compact-2016',
  'support.lockedOnModern':
    'la famille legacy-auth couvre la lignée verrouillée 0.x / 1.x ; {version} est sur la lignée moderne, qui demande modern-4x',
  'support.notCompactPro':
    'la famille compact-2016 couvre la lignée Compact PRO 1.0.3.x ; {version} n’en fait pas partie',
  'support.earlyCompact':
    'la famille early-compact ne couvre que les builds antérieurs à {first}, et {version} est lu par legacy-auth',
  'support.generic':
    'la famille de la caméra n’est pas identifiée (famille generic) : la disposition des emplacements et la forme de transfert sont donc inconnues ; identifiez la caméra avant de lire ou d’écrire un emplacement',
  'support.noPlan':
    'aucun plan d’emplacements n’existe pour la famille {family} : la disposition de ses emplacements et sa forme de transfert sont inconnues',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'la table de ce build n’ouvre pas le mode {mode} à {address} sur le canal simple',
  'support.noArmToken':
    'la table de ce build n’ouvre pas le mode {mode} à {address} sur le canal à jeton',
  'support.windowElsewhere': 'la fenêtre de préservation {bank:gen} est à {at}, pas à {address}',
  'support.noDumpWindow':
    'la table BeginFirmwareUpgrade de ce build n’a aucune fenêtre à {address} pour {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} ne prend pas en charge {capability} : {reason}',
  'support.capability.dump': 'le dump',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '« Extraire tous les sélecteurs »',
  'support.capability.decrypt': 'le déchiffrement',
  'support.capability.deviceInfo': 'la lecture complète de l’onglet Infos',
  'support.capability.flash': 'les écritures d’emplacements',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name:ins} à {address} n’est pas lisible sur ce build : sa table de sélecteurs n’y a aucune fenêtre, rien n’a donc été ouvert pour lui',
  'slots.unread.missing': '{name:ins} est absent de l’analyse de la caméra',
  'slots.unread.notRead': '{name:ins} n’a pas été lu',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Rien n’a été écrit.',
  'slots.refused.versionUnknown':
    'l’analyse ne dit pas quel firmware exécute la caméra, et les commandes d’emplacement n’ont pas le même sens selon les builds. Relisez les informations de l’appareil.',
  'slots.refused.versionUnknownWrite':
    'l’analyse ne dit pas quel firmware exécute la caméra. Rien n’a été écrit.',
  'slots.refused.emptyInput': 'l’entrée est vide',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name:ins} est vide et ne peut pas être écrit sur ce build : {reason}',
  'slots.refused.noRaw': '{name:ins} ne peut pas recevoir d’octets bruts sur ce build : {reason}',
  'slots.refused.noPlain':
    '{name:ins} ne peut pas recevoir d’image déchiffrée sur ce build : {reason}',
  'slots.refused.noStaging':
    '{name:ins} n’a aucune forme de transfert sur ce build : une image ne peut donc pas être encodée pour lui',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} o : plus long que {name:acc} ({bankSize} o)',
  'slots.refused.imageTooLong': 'l’image fait {size} o, plus que {name:acc} ({bankSize} o)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'le bootloader de 2014 n’accepte pas la somme de contrôle de ce build dans l’emplacement A ou B, et démarre l’emplacement de secours R (0x14070000) sans le vérifier : le correctif est donc écrit dans l’emplacement de secours R et nulle part ailleurs',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly':
    'ce build ne démarre que depuis l’emplacement de secours R : {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'un emplacement de firmware fait {size} o ({kib} Ko) ; ce fichier fait {count} o',
  'decryptFile.erasedBank':
    'vide, rien à déchiffrer : les {size} o se lisent comme 0xFF (un emplacement effacé)',
  'decryptFile.erasedHeader':
    'effacé : la fenêtre d’en-tête vaut entièrement 0xFF, l’emplacement ne contient donc aucune image ; rien n’est déchiffré',
  'decryptFile.noHeader':
    'pas d’en-tête d’image (signature {magic}) : il n’y a donc aucune image à déchiffrer',
  'decryptFile.lengthOutOfRange':
    'header.length {length} est hors limites ; aucune image à déchiffrer',
  'decryptFile.ffKeyB':
    '{size} o déchiffrés sous la clé B de FF 1.3.0.8 : l’image est stockée sous forme de l’image XOR le flux de clé de son bloc de clés 1, fenêtre d’en-tête telle quelle',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'clé non retrouvée : l’image se déchiffre en un vecteur de réinitialisation qui n’est pas un point d’entrée Cortex-M (clé {check}) ; rien n’est déchiffré',
  'decryptFile.storedPlain':
    'stocké en clair : l’emplacement contient l’image telle qu’elle s’exécute (la chaîne en clair de 2014, un flux de clé identité) : il n’y a donc pas de clé, et l’image déchiffrée est l’image elle-même',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted':
    '{size} o déchiffrés sous la clé retrouvée à partir de cet emplacement ({check})',
  'decryptFile.decryptedNamed':
    '{size} o déchiffrés sous la clé retrouvée à partir de cet emplacement ({check} ; c’est {key:acc})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'lecture courte ({size} o)',
  'read.reason.noParse': 'impossible d’analyser un en-tête d’image',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'pas d’en-tête d’image (signature {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} est hors limites',
  'read.reason.stopped': 'lecture de l’emplacement arrêtée à {count}/{size} o',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'illisible sur le firmware {version} : son plan ({table}) n’a aucune fenêtre à {address}, rien n’a donc été ouvert pour lui',
  'read.reason.notInPlanUnknown':
    'illisible sur un firmware de version inconnue : son plan ({table}) n’a aucune fenêtre à {address}, rien n’a donc été ouvert pour lui',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'la fenêtre a fourni les octets d’un descripteur de lecteur périmé — le mot 0 {word} avec la réinitialisation {hex} est la table des vecteurs de 0x14000000, pas le contenu de cet emplacement : rien n’en a donc été analysé : {remedy}',
  'read.reason.spentReader': 'les emplacements de la caméra n’ont pas pu être lus — {remedy}',
  'read.spentRemedy':
    'le lecteur de fenêtres est peut-être épuisé pour ce démarrage ; éteignez puis rallumez la caméra et réessayez',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'le mot de l’emplacement actif de la caméra (racines fw info, sélecteur 10) n’a pas pu être lu',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'le mot de l’emplacement actif de la caméra vaut {word}, qui ne désigne aucun emplacement',
  'checkKey.unnamed.cfg0NotRead':
    'le mot de configuration de démarrage n’a pas été lu : on ne sait donc pas si le bootloader a vérifié {bank:acc} avant d’y entrer',
  'checkKey.unnamed.noZeroSum':
    'la caméra indique être entrée dans {bank:acc}, mais {bank:acc} ne se déchiffre pas avec une somme des mots nulle lors de cette lecture',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'la caméra indique être entrée dans {bank:acc}, que le mot de configuration de démarrage {word} place en dernier : le bootloader y est donc entré sans sa vérification, mais {bank:acc} ne se déchiffre pas avec une somme des mots nulle lors de cette lecture',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (score {score} après la lecture, d’après les indices ci-dessous)',
  'report.detectedAmbiguous':
    '{family} (score {score} après la lecture, d’après les indices ci-dessous ; ambigu)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'oui',
  'report.cell.no': 'non',
  'report.cell.notApplicable': 's.o.',
  'report.cell.unknown': 'inconnu',
  'report.cell.recoveryOnly': 'secours uniquement',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'blanchiment K',
  'report.keyRow.store': 'clé de stockage',
  'report.keyRow.check': 'clé de vérification',
  'report.keyRow.table': 'table des clés',
  'report.keyRow.keys': 'clés',
  'report.keyRow.a': 'clé A',
  'report.keyRow.b': 'clé B',
  'report.keyRow.tableAt': 'table à',
  'report.key.notIdentified': '(non identifiée)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} candidate, aucune confirmée',
    many: '{count} candidates, aucune confirmée',
    other: '{count} candidates, aucune confirmée',
  },
  'report.key.tableAt':
    '{offset} dans le bloc du bootloader, confirmée par rapport à un emplacement',
  'report.key.plainChain':
    'aucune nécessaire : les emplacements sont stockés sous forme de firmware en clair, un emplacement se lit et s’écrit donc tel quel',
  'report.key.tableRefused2016':
    'non lue — le bloc du bootloader (0x14000000) est refusé sur tous les canaux sur cette lignée',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, identifiée à partir {bank:gen}, l’emplacement où la caméra indique être entrée après la vérification du bootloader',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, déduite {bank:gen}, l’emplacement où la caméra indique être entrée : le bootloader entre dans cet emplacement sans sa vérification, et l’exécute sous la clé avec laquelle il vérifie les autres emplacements',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (bloc 1 de {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'la paire Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'la paire Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'non identifiée — {why}',
  'report.checkKey.couldNotName': 'la lecture n’a pas pu l’identifier',
  'report.storeKey.checkKeyUnnamed':
    'la clé avec laquelle son bootloader vérifie un emplacement (non identifiée lors de cette lecture) : l’application stocke chaque emplacement qu’elle écrit sous cette clé',
  'report.storeKey.checkKey':
    '{key} : l’application stocke chaque emplacement qu’elle écrit sous la clé avec laquelle son bootloader vérifie',
  'report.storeKey.unknown':
    'inconnue — le bloc du bootloader qui contient l’emplacement de la clé propre à l’appareil n’a pas été lu',
  'report.storeKey.keyBUnidentified':
    'clé B (aucune clé propre à l’appareil programmée ; la clé B elle-même n’est pas identifiée)',
  'report.storeKey.keyB': 'clé B (aucune clé propre à l’appareil programmée)',
  /** How each bank is staged: said after "each bank" (info:report.oneBank). */
  'report.staged.plain': 'transféré en clair (l’image telle quelle, sans clé)',
  'report.staged.slotKeystream': 'transféré sous le bloc de clés 0 propre à son image',
  'report.staged.keyA':
    'transféré sous des clés dérivées de l’emplacement démarré et de l’application en cours',
  'report.staged.ffVendor':
    'transféré comme l’app du fabricant transfère l’image FF 16 Hz (l’image XOR son propre bloc de clés 0), et stocké par la caméra sous la clé B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Sauvegarde : bloc {address}',
  'progress.backupDone': 'Sauvegarde : tous les blocs lus',
  'progress.checkBlock': 'Vérification : bloc {address}',
  'progress.checkDone': 'Vérification : tous les blocs lus',
  'progress.writingBank': 'Écriture {bank:gen}',
  'progress.restoringBank': 'Restauration {bank:gen}',
  'progress.staged': '{label} : {done}/{total} o transférés',
  'progress.wholeFlash': 'Lecture complète : {got}/{total} o',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'lecture {address} subcmd={subcmd}…',
  'progress.readWindowAuth': 'lecture {address} subcmd={subcmd} (auth)…',
  'progress.windowsRead': 'Terminé — {ok}/{total} fenêtres lues.',
  'progress.readingBank': 'Lecture {bank:gen}…',
  'progress.analysing': 'Analyse…',
  'progress.probeSelector': 'essai du sélecteur {selector}…',
  'progress.selectorsArmed':
    'Terminé — {armed}/{span} sélecteurs ouverts, {withData} avec des données.',
  'progress.recoveringKey': 'déchiffrement : recherche de la clé pour {address}…',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank:ins} {address} (subcmd {subcmd}) n’a pas pu être lu : {error}',
  'slots.read.refusedBuild':
    'refus de lire les emplacements du firmware : {reason}. Rien d’autre que la lecture de la version n’a été envoyé : aucun emplacement n’a donc été touché.',
  'slots.backup.notSaved':
    'la sauvegarde {file} n’a pas été enregistrée : rien n’a donc été écrit. Une écriture ne s’exécute jamais sans que sa sauvegarde ait d’abord été enregistrée ; réessayez quand elle pourra l’être.',
  'slots.backup.notSavedWhy':
    'la sauvegarde {file} n’a pas été enregistrée ({error}) : rien n’a donc été écrit. Une écriture ne s’exécute jamais sans que sa sauvegarde ait d’abord été enregistrée ; réessayez quand elle pourra l’être.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'haute vitesse (480 Mbit/s)',
  'usb.speed.full': 'pleine vitesse (12 Mbit/s)',
  'usb.speed.code': 'code {code}',
} satisfies Translation<'core'>;

/**
 * Namespace `preserve`, français (fr), translated from the English source: the "Dump & decrypt 0.x/1.x 2014/2016" tab, a guided run that
 * backs up the camera, writes a temporary patch so the whole flash can be read, then puts the original
 * firmware back and checks it.
 *
 * Owner: phase 2, preserve agent.
 * Covers: views/PreserveView.tsx, hooks/usePreservePanel.ts, lib/preserve/* (gating.ts, types.ts).
 *
 * Words used all over this tab:
 * - run = one pass of the wizard on one camera, from the backup to the check. Run file = the zip the
 *   browser downloads after every step; it is the run's only record and lets a run continue later.
 * - Step 01 is Connect (shared with the other tabs); the phases are steps 02, 03 and 04. "Step 02"…
 *   keep the two-digit numbers.
 * - bank = one of the camera's three firmware slots, A, B and R (R = recovery). {bank}, {a}, {b}, {r}
 *   and {banks} are names from common:bank.*: "Slot A" / "Recovery R" on their own, "slot A" /
 *   "recovery R" inside a sentence. {banks} is a list of those names ("slot A, slot B and recovery R").
 * - the write = the patch written into the chosen banks (step 03); the restore = the original firmware
 *   written back (step 04); the whole-flash read = reading the full 4 MiB flash once the patch runs.
 * - "Connect device" is the page's connect button (app:connect.connect): use the same words.
 * - The step names on the chips (Backup, Patch, Write, Whole-flash read, Restore, Check) are core's
 *   words, translated in core:preserve.step.*. The sentences core writes ({why}, {reason}, {what},
 *   {build}…) arrive already translated, from the `core` namespace.
 * - SPI, SWD/J-Link, MiB/KiB, sha256, hex values and file names stay as they are.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* ---- "What to expect", the first section ---- */
  'how.title': 'À quoi s’attendre',
  'how.descriptionIdle': 'Connectez la caméra, puis commencez à l’étape 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Exécution {runId}.',
  'how.descriptionRunVersion': 'Exécution {runId} — firmware {version}.',
  'how.restarts':
    'La caméra **redémarre** pendant chaque étape. Après un redémarrage, Chrome ne la reconnaît plus (elle n’a pas de numéro de série USB) : la page vous demande donc d’appuyer sur **Connecter l’appareil** et de la choisir à nouveau. C’est le déroulement normal — l’étape reprend d’elle-même dès que vous l’avez fait.',
  'how.noFile':
    'Il n’y a aucun fichier de firmware à choisir : tout est lu dans la caméra elle-même.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'La caméra garde son firmware dans trois **emplacements** ({a}, {b} et {r}). L’étape 02 lit les trois et détermine celui depuis lequel la caméra démarrera la prochaine fois ; le correctif ne fonctionne que si cet emplacement le contient. Vous choisissez les emplacements que corrige l’étape 03 — par défaut celui du prochain démarrage —, et l’étape 04 les remet tous en état.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Après chaque étape, votre navigateur télécharge un **fichier d’exécution** nommé d’après le début de l’exécution, l’heure d’enregistrement et l’étape atteinte (`{example}`), avec un dossier par étape à l’intérieur. Gardez le plus récent — il vous permet de reprendre plus tard.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Les étapes 03 et 04 écrivent dans la mémoire flash de la caméra**, et chacune vous demande d’abord confirmation. Pendant que l’une d’elles s’exécute, laissez la caméra branchée (sauf si la page vous demande de la rebrancher) et l’ordinateur hors veille, si possible sur secteur. Une écriture interrompue laisse une caméra que seul un programmateur matériel (SPI ou SWD/J-Link) peut réparer.',
  'how.phone':
    '**Sur un téléphone :** avant l’étape 03, activez le mode avion et coupez le Wi-Fi et les données mobiles, pour qu’un appel ou une notification ne puisse pas détourner le navigateur en pleine écriture — et gardez l’écran allumé. Une fois ouverte, la page continue de fonctionner hors ligne.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**L’écriture n’est pas enregistrée pour cette exécution : les étapes suivantes sont donc bloquées.** La caméra exécute peut-être déjà l’image corrigée (écriture interrompue) ou peut-être pas (l’écriture n’a jamais commencé) — le fichier d’exécution ne permet pas de le savoir. Ne lancez ni la lecture complète ni la restauration sur une caméra corrigée sans que l’écriture soit enregistrée ; la marche à suivre est l’étape 03, dont la vérification avant écriture lit l’emplacement et refuse de l’écrire de nouveau à l’aveugle. Le saut ne s’applique que si cette vérification a déjà refusé avec *already holds the patched bytes* — et il passe par sa propre fenêtre de confirmation.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Lecture et préparation',
  'phase.readBuild.inSentence': 'la lecture et la préparation',
  'phase.readBuild.description':
    'Lit tout ce qu’une caméra d’origine laisse sortir — 31 blocs de 64 Ko — et le garde comme sauvegarde, lit une seconde fois chaque emplacement de firmware, détermine depuis quel emplacement la caméra démarrera la prochaine fois et prépare le petit correctif qu’écrit l’étape suivante. Rien n’est écrit dans la caméra. En général moins d’une minute. Si la caméra doit redémarrer en cours de route, la page vous demande d’appuyer sur « Connecter l’appareil » et de la choisir à nouveau — c’est normal.',
  'phase.patchDump.label': 'Écriture et lecture complète',
  'phase.patchDump.inSentence': 'l’écriture et la lecture complète',
  'phase.patchDump.description':
    'Écrit un petit correctif temporaire dans les emplacements de firmware choisis à l’étape 02 (par défaut celui du prochain démarrage), pour que la caméra puisse lire toute sa mémoire flash. Puis la caméra redémarre — appuyez sur « Connecter l’appareil » et choisissez-la à nouveau quand la page le demande — et toute la mémoire flash de 4 Mo est lue. L’étape 04 remet le firmware d’origine en place.',
  'phase.restoreVerify.label': 'Restauration et vérification',
  'phase.restoreVerify.inSentence': 'la restauration et la vérification',
  'phase.restoreVerify.description':
    'Réécrit votre firmware d’origine, redémarre la caméra (appuyez sur « Connecter l’appareil » et choisissez-la à nouveau quand c’est demandé), puis relit tout pour vérifier que le résultat correspond à la sauvegarde octet pour octet.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Lit les 31 blocs de 64 Ko qu’une caméra d’origine laisse lire, puis relit chaque emplacement (les deux lectures doivent concorder octet pour octet), extrait le firmware de chaque emplacement à partir de ce que la caméra stocke (en le déchiffrant s’il est stocké chiffré) et le vérifie, puis détermine depuis quel emplacement la caméra démarrera ensuite. C’est la seule copie de cette caméra dans l’exécution, faite avant toute écriture.',
  'step.patch.description':
    'Hors ligne, sans caméra. Prépare le correctif de chaque emplacement que l’exécution peut écrire : il permet à la lecture de la caméra d’atteindre toute la mémoire flash de 4 Mo, et il est écrit sous la forme dans laquelle la caméra le stocke, de sorte que seuls les octets du correctif changent.',
  'step.commit.description':
    'L’écriture. Relit d’abord chaque emplacement choisi et n’écrit rien si l’un d’eux ne contient plus ce que la sauvegarde a enregistré (une écriture déjà faite n’est jamais répétée), puis les écrit, en terminant par l’emplacement que la caméra essaie en premier. La caméra n’est pas redémarrée ici : l’étape suivante s’en charge.',
  'step.drain.description':
    'Redémarre la caméra pour qu’elle lance le firmware corrigé (elle reste muette une dizaine de secondes ; la page attend et la retrouve), vérifie depuis quel emplacement elle a démarré (un emplacement sans le correctif arrête l’étape avant toute lecture), puis lit toute la mémoire flash de 4 Mo en une seule lecture et replace, dans l’image enregistrée, le firmware d’origine de chaque emplacement écrit, pris dans la sauvegarde. Rien n’est écrit.',
  'step.restore.description':
    'L’autre écriture. Réécrit le firmware d’origine de chaque emplacement écrit pendant que le firmware corrigé tourne encore, puis redémarre la caméra.',
  'step.verify.description':
    'Après un démarrage à neuf, relit les 31 blocs, dont chaque emplacement : 0 octet différent prouve que la mémoire flash de la caméra est identique octet pour octet à la sauvegarde. Lecture seule.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Lancer {phase}',
  'phase.retry': 'Réessayer {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Passer à l’étape 04 : restaurer les emplacements',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Passer outre l’écriture non enregistrée',
  'phase.skipWrite': 'Sauter l’écriture — commencer à la lecture complète',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Actions : {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'écrit dans la caméra',
  'badge.running': 'En cours',
  'badge.done': 'Terminé',
  'badge.plannedStop': 'Arrêt prévu — la restauration suit',
  'badge.failed': 'Arrêté — voir le journal',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Étape suivante',
  /* Why the start button is off. */
  'notReady.noRun': 'Disponible après l’étape 02 — c’est elle qui lance l’exécution.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Disponible après l’étape {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Pas encore prêt — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Concerne la caméra corrigée tant que l’écriture n’est pas enregistrée — la caméra est peut-être déjà corrigée. Voir la note sous « {section} ».',
  'phase.noDrain':
    'La lecture complète n’a pas été faite — cette étape remet la caméra en état sans elle. Lancez d’abord l’étape 03, sauf si la lecture complète ne vous importe pas.',
  'phase.keepPlugged':
    'Laissez la caméra branchée et l’ordinateur hors veille jusqu’à la fin de cette étape.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Progression',
  'phase.showDetails': 'Afficher les détails dans le journal',
  'phase.inDetail': 'Ce que fait cette étape, en détail',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'À vous',
  'yourTurn.reconnect.title': 'À vous : appuyez sur Connecter l’appareil et choisissez la caméra.',
  'yourTurn.reconnect.body':
    'La caméra a redémarré, comme prévu. Chrome ne peut pas la reconnaître seul (elle n’a pas de numéro de série USB) : il faut donc la choisir encore une fois. L’étape reprend dès que vous l’avez fait.',
  'yourTurn.replug.title':
    'À vous : débranchez la caméra, rebranchez-la, puis appuyez sur Connecter l’appareil.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Le correctif de cette exécution date d’avant la correction du lecteur : la caméra doit donc être remise sous tension avant la restauration. Le fichier d’exécution est déjà enregistré.',
  'yourTurn.replugBeforeRestore.title':
    'Avant l’étape 04 : débranchez la caméra, rebranchez-la, puis appuyez sur Connecter l’appareil.',
  'yourTurn.powerCycle.title':
    'À vous : débranchez la caméra, rebranchez-la, appuyez sur Connecter l’appareil — puis réessayez.',
  'yourTurn.powerCycle.body':
    'Le lecteur de la caméra doit être remis sous tension avant de pouvoir être relu. L’exécution est toujours chargée ici ; rien n’est perdu.',
  'yourTurn.powerCycleAssert.title':
    'À vous : débranchez la caméra, rebranchez-la, appuyez sur Connecter l’appareil — puis continuez.',
  'yourTurn.powerCycleAssert.body':
    'La dernière tentative de sauvegarde s’est arrêtée, et la caméra doit être remise sous tension avant de relancer. La caméra ne peut pas le signaler elle-même : le bouton ci-dessous indique à la page que vous l’avez fait.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Je l’ai rebranchée — continuer {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Emplacements que corrige l’étape 03',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Mot de config. de démarrage',
  'banks.lastStart': 'Dernier démarrage',
  'banks.nextStart': 'Prochain démarrage',
  'banks.caption': 'Les trois emplacements de firmware, tels que l’étape 02 les a lus',
  'banks.col.bank': 'Emplacement',
  'banks.col.address': 'Adresse',
  'banks.col.holds': 'Contenu',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'prochain démarrage',
  'banks.choiceLabel': 'Emplacements à corriger',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Celui du prochain démarrage',
  'choice.all': 'Tous les emplacements',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — non proposé',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen':
    'Aucun emplacement n’est encore choisi : {what}. Choisissez un emplacement par son nom ci-dessus.',
  'banks.writes': 'L’étape 03 écrit {what}.',
  'banks.fixed':
    'L’écriture a eu lieu, le choix est donc figé : l’étape 04 remet en état exactement ces emplacements.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice} : non proposé — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'aucune exécution n’est active — l’étape 02 en lance une',
  'banks.refusedBusy':
    'une étape est en cours — choisissez les emplacements une fois qu’elle est terminée',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Le plan — {build}, corrige {banks:acc}',
  'plan.summaryNone': 'Le plan — {build}, aucun emplacement choisi pour l’instant',
  'plan.yourCamera': 'votre caméra',
  'plan.intro':
    'Établi à partir des octets de la caméra elle-même. Rien n’est écrit avant l’étape 03, et l’étape 04 remet en place chaque octet qu’elle écrit.',
  /* The rows; their values are core's. */
  'plan.build': 'Build',
  'plan.version': 'Version du firmware',
  'plan.written': 'Écrit',
  'plan.route': 'Destination',
  'plan.restore': 'Restauration',
  'plan.wholeFlash': 'Lecture complète',
  'plan.outro':
    'Dans la forme que stocke la caméra, les mêmes octets changent et aucun autre : le firmware de la caméra change exactement de cette différence, et de rien d’autre.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Le correctif {bank:gen}',
  'bankPlan.titleChosen': '{bank} — écrit par cette exécution',
  'bankPlan.titleNotChosen': '{bank} — non choisi',
  'bankPlan.source': 'Source de l’image',
  'bankPlan.sourceValue': '{bank}, tel que stocké',
  'bankPlan.sourceTwoReads': '{bank}, tel que stocké, deux lectures concordantes (sha256 {sha})',
  'bankPlan.edit': 'Modification de l’image',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) sur l’image d’usine. Son équilibrage, {balance}, est dans le mot d’ajustement ; le correctif s’équilibre par-dessus, et l’étape 04 remet l’image en place avec la modification.',
  'bankPlan.factorySha': 'sha256 d’usine en clair',
  'bankPlan.patchedSha': 'sha256 corrigé',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Octets modifiés dans la flash',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Longueur transférée',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} o en {count} bloc',
    many: '{size} o en {count} blocs',
    other: '{size} o en {count} blocs',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Mot d’équilibrage',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (était {balance}, l’équilibrage de la modification)',
  'bankPlan.caption': 'Les octets exacts que le correctif modifie {bank:loc}',
  'bankPlan.col.what': 'Ce qu’il change',
  'bankPlan.col.offset': 'Décalage',
  'bankPlan.col.before': 'Avant',
  'bankPlan.col.after': 'Après',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Vérifié — correspondance parfaite.** Après un démarrage à neuf, la caméra a été relue : {read}/31 blocs, {count} octet différent. Sa mémoire flash est exactement ce qu’elle était avant la première écriture.',
    many: '**Vérifié — correspondance parfaite.** Après un démarrage à neuf, la caméra a été relue : {read}/31 blocs, {count} octets différents. Sa mémoire flash est exactement ce qu’elle était avant la première écriture.',
    other:
      '**Vérifié — correspondance parfaite.** Après un démarrage à neuf, la caméra a été relue : {read}/31 blocs, {count} octets différents. Sa mémoire flash est exactement ce qu’elle était avant la première écriture.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Vérifié — correspondance parfaite.** Après un démarrage à neuf, la caméra a été relue : {read}/31 blocs, {count} octet différent (blocs courts : {blocks}). Sa mémoire flash est exactement ce qu’elle était avant la première écriture.',
    many: '**Vérifié — correspondance parfaite.** Après un démarrage à neuf, la caméra a été relue : {read}/31 blocs, {count} octets différents (blocs courts : {blocks}). Sa mémoire flash est exactement ce qu’elle était avant la première écriture.',
    other:
      '**Vérifié — correspondance parfaite.** Après un démarrage à neuf, la caméra a été relue : {read}/31 blocs, {count} octets différents (blocs courts : {blocks}). Sa mémoire flash est exactement ce qu’elle était avant la première écriture.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**La vérification a trouvé des différences avec la sauvegarde.** {error}',
  unknownReason: 'raison inconnue',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — écrire dans {banks:acc} ?',
  'confirm.titleJump': '{phase} — passer outre l’écriture non enregistrée ?',
  'confirm.chosenBanks': 'les emplacements choisis',
  'confirm.jump':
    'L’ÉCRITURE N’EST PAS ENREGISTRÉE pour cette exécution, et vous affirmez que les écritures ont abouti sans leurs points de contrôle : l’étape commence après l’écriture au lieu d’écrire à nouveau. Les vérifications propres aux étapes ont quand même lieu — la lecture de la version, les vérifications des emplacements — et une erreur de jugement coûte une lecture complète pour rien, pas une caméra hors d’usage.',
  'confirm.jumpKeepPlugged':
    'Laissez la caméra branchée et l’ordinateur hors veille jusqu’à la fin de l’étape.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Ceci écrit un petit correctif dans {banks:acc}. L’étape 04 remet les originaux en place. La lecture complète qui suit ne fait que lire.',
  'confirm.patchInOrder':
    'Ceci écrit un petit correctif dans {banks:acc}, dans cet ordre — l’emplacement que la caméra essaie en premier passe en dernier. L’étape 04 remet les originaux en place. La lecture complète qui suit ne fait que lire.',
  /* Step 04. */
  'confirm.restore': 'Ceci réécrit votre firmware d’origine dans {banks:acc}.',
  'confirm.restoreInOrder':
    'Ceci réécrit votre firmware d’origine dans {banks:acc}, dans cet ordre — l’emplacement que la caméra essaie en premier passe en premier.',
  'confirm.keepPlugged':
    'Laissez la caméra branchée et l’ordinateur hors veille pendant l’écriture — une écriture interrompue laisse une caméra que seul un programmateur matériel (SPI ou SWD/J-Link) peut réparer. Sur un téléphone : mode avion activé et écran maintenu allumé. La caméra redémarre ensuite ; quand la page le demande, appuyez sur Connecter l’appareil et choisissez-la à nouveau. C’est normal.',
  'confirm.yesJump': 'Oui — passer outre l’écriture',
  'confirm.yesWrite': 'Oui — écrire dans la caméra',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'La preuve',
  'summary.complete': 'Image complète (4 Mo)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'non produite',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'diffère de la sauvegarde sur {differing} bloc sur {count} : {blocks}',
    many: 'diffère de la sauvegarde sur {differing} blocs sur {count} : {blocks}',
    other: 'diffère de la sauvegarde sur {differing} blocs sur {count} : {blocks}',
  },
  'summary.matches': {
    one: 'correspond à la sauvegarde sur son unique bloc ({count})',
    many: 'correspond à la sauvegarde sur l’ensemble des {count} blocs',
    other: 'correspond à la sauvegarde sur l’ensemble des {count} blocs',
  },
  'summary.onlyInFull': 'Seulement dans la lecture complète',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} bloc qu’une lecture d’origine ne peut pas atteindre : {blocks}',
    many: '{count} blocs qu’une lecture d’origine ne peut pas atteindre : {blocks}',
    other: '{count} blocs qu’une lecture d’origine ne peut pas atteindre : {blocks}',
  },
  'summary.rawDump': 'Lecture complète, telle que lue',
  'summary.rawDumpBadge': 'la même, avec le correctif encore présent',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Image du firmware (déchiffrée, {bank})',
  'summary.verify': 'Vérification',
  'summary.toolbar': 'Actions sur l’archive',
  'summary.download': 'Télécharger l’archive complète (fichier d’exécution)',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Facultatif — pour reprendre une exécution plus tard',
  'runFile.title': 'Fichier d’exécution',
  'runFile.description':
    'La seule trace de l’exécution. Il se télécharge de lui-même après chaque étape (et après une étape arrêtée en cours de route) ; gardez le plus récent. Pour reprendre plus tard, ou après un problème, chargez-le ici et la page reprend là où elle s’était arrêtée.',
  'runFile.run': 'Exécution',
  'runFile.file': 'Fichier',
  'runFile.lastSaved': 'Dernier enregistrement',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'après {step} — {at} ({bytes} o)',
  'runFile.nextStep': 'Étape suivante',
  'runFile.none':
    'Aucune exécution n’est active. L’étape 02 en lance une, ou chargez ici un fichier d’exécution.',
  'runFile.toolbar': 'Actions sur le fichier d’exécution',
  'runFile.load': 'Charger un fichier d’exécution…',
  'runFile.save': 'Enregistrer de nouveau le fichier d’exécution',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Reprise',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Aucun fichier d’exécution choisi.',
  'status.notRun': 'Pas encore lancée.',
  'status.running': 'En cours…',
  'status.runningRestarts': 'En cours — la caméra redémarre pendant cette étape…',
  'status.restarting': 'La caméra redémarre — cela prend une dizaine de secondes…',
  'status.waitConnect':
    'En attente de votre action — appuyez sur « Connecter l’appareil » et choisissez la caméra…',
  'status.waitPlugBack':
    'En attente de votre action — rebranchez la caméra, puis appuyez sur « Connecter l’appareil »…',
  'status.waitReplug': 'En attente de votre action — débranchez la caméra et rebranchez-la…',
  'status.back': 'La caméra est revenue — on continue…',
  'status.swapped': 'Arrêté — la caméra a changé. Vérifiez-la, puis relancez la phase.',
  'status.noRun': 'Aucune exécution.',
  'status.notCreated': 'Non créée — voir le journal ci-dessus.',
  'status.refused': 'Refusé — la liste des phases ci-dessus indique ce qui manque.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — terminé. Le fichier d’exécution de vos téléchargements est à jour.',
  'status.doneReplug':
    '{phase} — terminé, et le fichier d’exécution est enregistré. Avant la restauration : débranchez la caméra, rebranchez-la et appuyez sur « Connecter l’appareil ».',
  'status.backupRefused': 'Refusé — rien n’a été écrit. Voir le journal ci-dessus.',
  'status.failed': 'Échec — voir le journal ci-dessus.',
  'status.cancelled':
    'Annulé — le fichier d’exécution indique toujours où l’exécution s’est arrêtée.',
  'status.readingFile': 'Lecture du fichier d’exécution…',
  'status.doneEarlier': 'Déjà terminé — chargé depuis le fichier d’exécution.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Échec précédent : {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Reprise à {step}. La liste des phases continue à partir de là.',
  'status.notResumed': 'Non reprise — voir le journal ci-dessus.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'il manque {missing}',
  'gate.noRun': 'aucune exécution n’est active — la première phase crée l’exécution',
  'gate.runDone': 'cette exécution est terminée — toutes les phases sont faites',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'déjà fait — la reprise continue à {step}',
  'gate.banksRead': 'les emplacements que lit la sauvegarde',
  'gate.choice': 'un choix d’emplacements — {why}',
  'gate.bankRefused': '{bank:ins} ne peut pas être écrit : {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'la voie par l’emplacement de secours (ce build ne démarre que depuis {r:acc}, pas depuis {bank:acc})',
  'gate.backupFirst': 'la sauvegarde de la flash (elle s’exécute en premier dans cette phase)',
  'gate.backup': 'la sauvegarde de la flash',
  'gate.patchStep': 'l’étape du correctif',
  'gate.patchOf': 'le correctif {bank:gen}',
  'gate.backupFile': 'le fichier des fenêtres de la sauvegarde',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'la capture {bank:gen}',
  'gate.derived': 'l’image dérivée {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'l’étape Écriture (lancez-la ou reprenez-la d’abord)',
  'gate.drainRefused': 'la lecture complète est refusée sur {build} — {why}',
  'gate.patchSummary': 'le résumé du correctif {bank:gen} (la longueur transférée)',
  'gate.restoreRefused':
    'la restauration est refusée sur {build} — aucune forme du firmware d’origine ne se stocke de nouveau sous forme des octets d’origine ; l’exécution se termine avec l’image complète et le correctif en place',
  /* {file} is a file name in the run file. */
  'gate.plaintext': 'le texte clair d’usine {bank:gen} ({file}, issu de l’étape de sauvegarde)',
  'gate.restoreFirst': 'la restauration (elle s’exécute en premier dans cette phase)',
  'gate.powerCycle':
    'la confirmation de la remise sous tension — éteignez puis rallumez la caméra (débranchez-la et rebranchez-la, ou utilisez son interrupteur), puis utilisez la commande de relance',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'la caméra n’est pas revenue après {minutes} min de tentatives : {error} — si Chrome n’a rien demandé, rebranchez la caméra et relancez la phase ; si le journal demandait de la reconnecter, c’est le clic sur « Connecter l’appareil » qui était attendu',
} satisfies Translation<'preserve'>;

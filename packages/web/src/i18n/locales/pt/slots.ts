/**
 * Namespace `slots`, português europeu (pt), translated from the English source: the firmware-slots tab.
 *
 * Owner: phase 2, slots agent.
 * Covers: views/SlotsView.tsx, hooks/useSlotsPanel.ts, components/SlotTable.tsx, SlotFpsConfirm.tsx,
 * SlotFpsEveryConfirm.tsx, SlotWriteConfirm.tsx, SlotFlashPreview.tsx, SlotWriteKeys.tsx.
 * (components/DeviceInfoPanel.tsx is done: its text is in `shared`, deviceInfo.*.)
 *
 * Words used all over this tab:
 * - bank = one of the camera's three firmware slots, A, B and R. R = the recovery slot, the
 *   last-resort copy the bootloader falls back to.
 * - {bank} is a bank's name from common:bank.* ("Slot A", "Recovery R" on its own; "slot A",
 *   "recovery R" inside a sentence). {a}, {b}, {r} are those names inside a sentence; {letter},
 *   {letterA}, {letterB}, {letterR} are the bare letters A, B and R (keep them Latin).
 * - booted = the bank the camera started from (the firmware it runs now).
 * - write / flash = erase a bank and program a new image into it. Commit = the camera's last step of a
 *   write, after which the bank may be changed.
 * - read-back = the bank read again after a write, to compare with what was sent.
 * - "Flash decrypted image", "Read slots", "Dump"… in quotes or bold are this tab's own buttons
 *   (table.flashPlain, actions.read, table.dump): use the same words as those keys.
 * - Hz values, firmware versions (0.8.0.0, 1.3.0.8), 0xFF, .bin/.zip, SWD/J-Link and SPI stay as they
 *   are. Key A / Key B: translate "Key", keep the letter. KiB/MiB are written KB/MB (README, Units).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* The section: its heading, badge and one-line summary. */
  'section.title': 'Gerir ranhuras de firmware',
  'section.badge': 'Escreve na flash',
  'section.description':
    '«Ler ranhuras» pergunta à câmara o que executa, lê as suas três ranhuras de firmware — {a}, {b} e {r} — e mostra o que cada uma contém. Ler e fazer o dump não alteram nada. Um botão de escrita pede confirmação antes de enviar qualquer byte.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Esta página pode escrever na memória flash da câmara.** Uma escrita apaga uma ranhura de 64 KB e programa-a. Uma imagem com estrutura válida mas que não funcione deixa a câmara incapaz de arrancar, e o bootloader não tem USB — só SWD/J-Link ou um programador SPI a conseguem recuperar. Faça primeiro o dump da ranhura e guarde o ficheiro.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Ações das ranhuras',
  'actions.read': 'Ler ranhuras',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Ranhuras',

  /* Before any read. */
  'empty.connected':
    'Prima «Ler ranhuras». Primeiro, a câmara é questionada sobre a compilação que executa, e não é aberta nenhuma janela numa compilação que esta página não suporte.',
  'empty.disconnected': 'Conecte a câmara e depois prima «Ler ranhuras».',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Esta compilação não é suportada aqui, por isso nenhuma ranhura foi lida e nenhuma pode ser escrita.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Não identificada: esta página não consegue saber qual a compilação que a câmara executa.',
  'refusal.notIdentified.body':
    'A câmara não deu uma versão de firmware utilizável, por isso nenhuma ranhura foi lida e não foi aberta nenhuma janela. Esta página cobre as compilações {minVersion} e posteriores. As compilações anteriores a {minVersion} estão fora do que a página de ranhuras suporta, por isso uma câmara com uma delas nunca é lida aqui.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Se a câmara executa uma compilação suportada, pode estar apenas a arrancar. {hint}',
  'refusal.title': 'Recusado — não foi aberta nenhuma janela.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'A ler...',
  'status.readingAgain': 'A ler as ranhuras de novo...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Lido. {read}/{count} ranhura lida.',
    many: 'Lido. {read}/{count} de ranhuras lidas.',
    other: 'Lido. {read}/{count} ranhuras lidas.',
  },
  'status.unsupported': 'Não suportado nesta compilação — nenhuma ranhura foi lida.',
  'status.refused': 'Recusado — não foi aberta nenhuma janela. Veja a mensagem abaixo do registo.',
  'status.disconnected': 'Dispositivo desconectado — leia as ranhuras de novo.',
  'status.newDevice': 'Novo dispositivo selecionado — leia as ranhuras de novo.',
  'status.dumping': 'A fazer o dump {bank:gen}...',
  'status.dumped': 'Dump {bank:gen} concluído.',
  'status.readingImage': 'A ler a imagem...',
  'status.ready': 'Pronto — reveja o plano e depois escreva-o.',
  'status.rejected': 'Rejeitado — veja o registo acima.',
  'status.writing': 'A escrever...',
  'status.patching': 'A aplicar o patch {bank:dat}...',
  'status.patchingEvery': 'A aplicar o patch a todas as ranhuras...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Escrito, mas a releitura não corresponde — veja o resultado.',
  'status.written.verified': 'Escrito. A releitura da ranhura corresponde ao que foi escrito.',
  'status.written.notCompared': 'Escrito. A releitura não foi comparada — veja o resultado.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Patch aplicado, mas a releitura não difere apenas como planeado — veja o resultado.',
  'status.patched.ok': 'Patch aplicado. A releitura da ranhura corresponde ao planeado.',
  'status.patched.unchecked': 'Patch aplicado. A releitura não foi verificada — veja o resultado.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Parou {bank:loc} — patch aplicado a {count} ranhura; veja o resultado.',
    many: 'Parou {bank:loc} — patch aplicado a {count} de ranhuras; veja o resultado.',
    other: 'Parou {bank:loc} — patch aplicado a {count} ranhuras; veja o resultado.',
  },
  'status.every.unchecked': {
    one: 'Patch aplicado a {count} ranhura, mas uma releitura não foi verificada como planeado — veja o resultado.',
    many: 'Patch aplicado a {count} de ranhuras, mas uma releitura não foi verificada como planeado — veja o resultado.',
    other:
      'Patch aplicado a {count} ranhuras, mas uma releitura não foi verificada como planeado — veja o resultado.',
  },
  'status.every.ok': {
    one: 'Patch aplicado a {count} ranhura. A releitura corresponde ao planeado.',
    many: 'Patch aplicado a {count} de ranhuras. A releitura de cada uma corresponde ao planeado.',
    other: 'Patch aplicado a {count} ranhuras. A releitura de cada uma corresponde ao planeado.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Cancelado — não foi escrito nada.',
  'status.cancelled.one':
    'Cancelado depois de ter sido enviada a confirmação da escrita {bank:loc} — a ranhura pode ter ficado parcialmente escrita. Leia-a antes de contar com ela.',
  'status.cancelled.many':
    'Cancelado depois de terem sido enviadas as confirmações da escrita {banks:loc} — cada uma pode ter ficado parcialmente escrita. Leia-as antes de contar com elas.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Primeiro, conecte a câmara.',
  'gate.busy': 'Está a decorrer outra operação — espere que termine.',
  'gate.readFirst': 'Primeiro, leia as ranhuras.',
  'gate.cameraRefused':
    'Esta câmara não pode ser escrita a partir daqui, pelo motivo indicado no aviso acima. Não é enviado nada.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Não lida: {reason}. Leia as ranhuras de novo antes de a escrever.',
  'gate.notReadNoReason':
    'Não lida: esta ranhura não foi lida. Leia as ranhuras de novo antes de a escrever.',
  'gate.emptyNotWritable':
    'Esta ranhura está vazia e não pode ser escrita nesta compilação: {reason}',
  'gate.noSuchBank': 'Esta compilação não tem esta ranhura.',

  /* The bank table. */
  'table.caption':
    'Cada ranhura de firmware desta câmara — {a}, {b} e {r} — tal como foi lida e verificada no browser',
  'table.col.bank': 'Ranhura',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Tamanho',
  'table.col.key': 'Chave',
  'table.col.bootable': 'Arrancável',
  'table.col.sha': 'SHA-256 desencriptado',
  'table.col.actions': 'Ações',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'não lida — {reason}',
  'table.notReadNoReason': 'não lida — a ranhura não foi lida',
  /* A badge: the bank holds no image. */
  'table.empty': 'vazia',
  'table.emptyNote':
    'Sem imagem: a janela do cabeçalho desta ranhura lê-se toda como 0xFF, por isso não se desencripta nada dela e escrevê-la não substitui nenhum firmware.',
  /* {why} and {reason} are core's. */
  'table.emptyWritable': 'Pode ser escrita. {why}',
  'table.emptyNotWritable': 'Não pode ser escrita nesta compilação: {reason}',
  'table.unknownVersion': 'versão desconhecida',
  /* {id} is the image id in hex. */
  'table.imageId': 'imagem {id}',
  'table.noImage': 'sem imagem',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'ranhura de {size} B',
  'table.imageSize': 'imagem de {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'nenhuma (sem encriptação)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nada para arrancar',
  'table.boot.bootable': 'arrancável — o bootloader aceita-a',
  'table.boot.notBootable': 'não arrancável — ignorada no arranque',
  'table.boot.recoveryOnly':
    'só recuperação — a ranhura {letterR} arranca quando {letterA} e {letterB} não contêm nada que o bootloader aceite (medido numa câmara com uma forma anterior desta imagem); não foi testado se esta forma arranca',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'desconhecido — {why}',
  /* The row's buttons. */
  'table.dump': 'Dump',
  'table.flashPlain': 'Escrever imagem desencriptada…',
  'table.flashRaw': 'Escrever bytes em bruto…',
  'table.restore': 'Restaurar de cópia de segurança completa (.bin ou .zip)…',
  'table.makeFps': 'Passar a {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Copiar para {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: desativado',
  'table.copyNote':
    'Copia o firmware que esta ranhura contém, tal como esta leitura o desencriptou, para a ranhura que escolher, seja o que for que essa ranhura contenha agora. Pode rever o plano antes de qualquer envio.',
  'table.restoreNote':
    'Escolha uma cópia de segurança completa da flash: um .bin (uma imagem completa da flash de 4 MB, como uma leitura por J-Link) ou um .zip que contenha uma (um ficheiro de execução do Preserve, ou o zip que «Dump e desencriptação 4.x/Nano» ou «Dump de todos os seletores» guarda). Esta ranhura é extraída dela, desencriptada e mostrada como plano antes de qualquer envio.',
  'table.fpsNote':
    'Passa esta ranhura de {fromHz} Hz para {toHz} Hz, alterando os seus bytes. Primeiro, a ranhura é guardada num zip transferido, e o ficheiro desencriptado que ele contém é a forma de voltar atrás.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery': '{booted}, e recuperação: escrevê-la pede uma confirmação extra.',
  'table.risk.booted': '{booted}: escrevê-la pede uma confirmação extra.',
  'table.risk.recovery': '{bank}: escrevê-la pede uma confirmação extra.',
  'table.risk.bootUnnamed':
    'A câmara não indica a ranhura de arranque: escrevê-la pede uma confirmação extra.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Patch da taxa de fotogramas aplicado: esta imagem funciona a {hz} Hz.',
  'fps.earlierPatch':
    'Patch da taxa de fotogramas indisponível: esta ranhura tem um patch anterior de {hz} Hz sem a correção do USB. Reponha a imagem original e depois use «Passar a {hz} FPS».',
  'fps.atRate': 'Não é preciso patch da taxa de fotogramas: esta compilação já funciona a {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Patch da taxa de fotogramas indisponível: {reason}',
  'fps.readFirst':
    'leia primeiro as ranhuras — o patch é planeado a partir da própria imagem da ranhura',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Todas as ranhuras',
  'everyBank.make': 'Passar todas as ranhuras a {hz} FPS',
  'everyBank.faster': 'Acelerar todas as ranhuras',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Aplica o patch {order:dat} numa só confirmação; cada uma é guardada primeiro, num único zip transferido, e relida no fim.',
  'everyBank.noteBootedLast':
    'Aplica o patch {order:dat} numa só confirmação, com a ranhura de arranque atual em último lugar; cada uma é guardada primeiro, num único zip transferido, e relida no fim.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'a imagem {bank:gen}',
  'what.restore': '{bank:acc} de {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Preparado para {bank:acc} em {address}',
  'preview.file': 'Ficheiro',
  'preview.source': 'Imagem obtida de',
  'preview.target': 'Destino',
  'preview.targetEmpty':
    '{bank:ins} está vazia: não contém imagem, por isso esta escrita não substitui nenhum firmware',
  'preview.readAs': 'Lido como',
  'preview.readAs.ff': 'uma imagem FF {version} desencriptada',
  'preview.readAs.plain': 'uma imagem desencriptada',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'bytes em bruto',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Preparação',
  'preview.key': 'Chave',
  'preview.payload': 'Dados enviados',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B em {count} bloco de até {chunk} B',
    many: '{size} B em {count} de blocos de até {chunk} B',
    other: '{size} B em {count} blocos de até {chunk} B',
  },
  'preview.checksum': 'Soma de verificação da transferência',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Guardado depois',
  'preview.storedNotPredicted': 'não previsto — a releitura é a verificação',
  'preview.storedPredicted': '{size} B previstos',
  'preview.storedKeyB': '{size} B previstos — a imagem XOR chave B, não os dados enviados em si',
  'preview.savedFirst': 'Guardado primeiro',
  'preview.compareCaption': 'O que muda {bank:loc}',
  'preview.col.field': 'Campo',
  'preview.col.now': 'Agora',
  'preview.col.after': 'Depois da escrita',
  'preview.readFirst': 'Leia antes de escrever:',
  /* {note} is core's note about this write. */
  'preview.note': 'Nota: {note}',
  'preview.nothingSent':
    'Ainda não foi enviado nada para a câmara. A escrita envia estes dados para {bank:acc} e confirma-os.',
  'preview.toolbar': 'Ações de escrita para {bank:acc}',
  'preview.write': 'Escrever {bank:loc}…',
  'preview.discard': 'Descartar',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Escrever {what} {bank:loc} em {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Escrevê-la substitui o firmware que a câmara está a executar agora. Se a nova imagem não funcionar, a câmara pode não arrancar de todo.',
  'writeConfirm.recovery':
    '{bank:ins} é a ranhura de recuperação, a cópia de último recurso a que o bootloader recorre. Escrevê-la deixa a câmara sem essa cópia até ser restaurada.',
  'writeConfirm.bootUnnamed':
    'A câmara não diz a partir de qual ranhura arranca, por isso {bank:acc} é tratada como a ranhura de arranque atual. Escrevê-la pode substituir o firmware que a câmara está a executar.',
  'writeConfirm.empty':
    '{bank:ins} está vazia: não contém imagem, por isso não é substituído nenhum firmware.',
  'writeConfirm.eraseEmpty':
    'Mesmo assim, a escrita apaga o bloco de 64 KB da memória flash da câmara {bank:loc} (já em branco) e programa-o.',
  'writeConfirm.erase':
    'Isto apaga um bloco de 64 KB da memória flash da câmara e programa-o {bank:loc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'A imagem é escrita com {key}. Todas as outras ranhuras são escritas da mesma forma.',
  'writeConfirm.backup':
    'Antes de qualquer envio, {bank:acc} é lida de novo e guardada num único zip transferido: {file}. Confirme que o zip está na pasta de transferências.',
  'writeConfirm.noReset':
    'Não é enviado nenhum reinício. Depois, desconecte a câmara e volte a conectá-la para a ranhura passar a ter efeito.',
  'writeConfirm.noUsbRecovery':
    'Se a imagem não funcionar, a câmara não pode ser recuperada por USB — só com SWD/J-Link ou um programador SPI.',
  'writeConfirm.ackUnnamed':
    'Compreendo que a câmara não diz a partir de qual ranhura arranca, por isso esta é tratada como a ranhura de arranque, e que uma imagem má pode deixar a câmara incapaz de arrancar.',
  'writeConfirm.confirm': 'Sim — escrever {bank:loc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Compreendo que esta é a ranhura a partir da qual a câmara arranca agora, e que uma imagem má pode deixar a câmara incapaz de arrancar.',
  'ack.recovery':
    'Compreendo que esta é a ranhura de recuperação, e que uma imagem má deixa a câmara sem uma cópia de último recurso.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Pôr {bank:acc} a funcionar a {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. A imagem com o patch substitui o firmware que a câmara executa agora.',
  'fpsConfirm.recovery':
    '{bank:ins} é a ranhura de recuperação, a cópia de último recurso a que o bootloader recorre.',
  'fpsConfirm.what':
    '{bank:ins} contém o firmware {version}, e isto põe a sua imagem a funcionar a {toHz} Hz em vez de {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(desconhecido)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'O patch altera {count} byte da imagem e a palavra da soma de verificação, para que a soma que o bootloader verifica se mantenha. O par de chaves não é alterado.',
    many: 'O patch altera {count} de bytes da imagem e a palavra da soma de verificação, para que a soma que o bootloader verifica se mantenha. O par de chaves não é alterado.',
    other:
      'O patch altera {count} bytes da imagem e a palavra da soma de verificação, para que a soma que o bootloader verifica se mantenha. O par de chaves não é alterado.',
  },
  'fpsConfirm.wayBack':
    'O ficheiro desencriptado nesse zip é a forma de voltar atrás: para desfazer o patch, escreva-o com «Escrever imagem desencriptada» {bank:loc}.',
  'fpsConfirm.noReset':
    'Não é enviado nenhum reinício. Depois, desconecte a câmara e volte a conectá-la para a ranhura com o patch passar a ter efeito.',
  'fpsConfirm.ackUnnamed':
    'Compreendo que a câmara não diz a partir de qual ranhura arranca, por isso esta é tratada como a ranhura de arranque.',
  'fpsConfirm.confirm': 'Sim — aplicar o patch {bank:dat}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Pôr todas as ranhuras a funcionar a {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Aplicar o patch da taxa de fotogramas a {count} ranhura?',
    many: 'Aplicar o patch da taxa de fotogramas a {count} de ranhuras?',
    other: 'Aplicar o patch da taxa de fotogramas a {count} ranhuras?',
  },
  'fpsEvery.intro': {
    one: 'Isto aplica o patch a {count} ranhura em que está disponível (firmware {version}):',
    many: 'Isto aplica o patch a {count} de ranhuras em que está disponível (firmware {version}):',
    other: 'Isto aplica o patch a {count} ranhuras em que está disponível (firmware {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (a ranhura a partir da qual esta câmara arranca agora, e a ranhura de recuperação)',
  'fpsEvery.role.booted': '{bank} (a ranhura a partir da qual esta câmara arranca agora)',
  'fpsEvery.role.recovery': '{bank} (a ranhura de recuperação, a cópia de último recurso)',
  'fpsEvery.role.bootUnnamed': '{bank} (a câmara não diz a partir de qual ranhura arranca)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: de {fromHz} Hz para {toHz} Hz, {count} byte e a palavra da soma de verificação.',
    many: '{bank}: de {fromHz} Hz para {toHz} Hz, {count} de bytes e a palavra da soma de verificação.',
    other:
      '{bank}: de {fromHz} Hz para {toHz} Hz, {count} bytes e a palavra da soma de verificação.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Ficam como estão: {others}',
  'fpsEvery.orderOne': 'Escreve apenas {bank:acc} e relê-a.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'São escritas por esta ordem: {order}. Cada uma é relida antes da seguinte, e a primeira falha interrompe as restantes.',
  'fpsEvery.orderBootedLast':
    'São escritas por esta ordem: {order}. A ranhura de arranque atual fica para o fim, por isso uma falha interrompe antes dela. Cada uma é relida antes da seguinte, e a primeira falha interrompe as restantes.',
  'fpsEvery.wayBack':
    'Os ficheiros desencriptados nesse zip são a forma de voltar atrás: para desfazer o patch de uma ranhura, escreva o ficheiro dela com «Escrever imagem desencriptada» nessa ranhura.',
  'fpsEvery.noReset':
    'Não é enviado nenhum reinício. Depois, desconecte a câmara e volte a conectá-la para as ranhuras com o patch passarem a ter efeito.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Compreendo que isto escreve nas seguintes ranhuras — {banks} — e que uma imagem má pode deixar a câmara incapaz de arrancar.',
  'fpsEvery.confirm': {
    one: 'Sim — aplicar o patch a {count} ranhura',
    many: 'Sim — aplicar o patch a {count} de ranhuras',
    other: 'Sim — aplicar o patch a {count} ranhuras',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: a releitura da ranhura corresponde ao que foi escrito.',
  'outcome.mismatch': '{bank} — {what}: a releitura NÃO corresponde ao que foi escrito.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: a releitura foi feita mas não foi comparada, por isso esta escrita não é verificada aqui.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'A confirmação da escrita na câmara devolveu o estado {status}.',
  'outcome.wasEmpty':
    '{bank:ins} estava vazia antes desta escrita, por isso não foi substituído nenhum firmware.',
  'outcome.provenVerified':
    'Provado até agora: os dados foram enviados e confirmados, e a releitura da ranhura corresponde ao que foi escrito. NÃO provado: que o bootloader vá selecionar esta ranhura, nem que a imagem funcione.',
  'outcome.provenCommitted':
    'Provado até agora: os dados foram enviados e confirmados. NÃO provado: que o bootloader vá selecionar esta ranhura, nem que a imagem funcione.',
  'outcome.replug':
    '**AGORA DESCONECTE A CÂMARA E VOLTE A CONECTÁ-LA.** Não foi enviado nenhum reinício, por isso a ranhura só passa a ter efeito depois de a câmara ser realmente desligada e voltar a ser ligada. Depois, leia as ranhuras de novo: a versão e a ranhura ativa que a câmara indica são a única coisa que o confirma.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**AGORA DESCONECTE A CÂMARA E VOLTE A CONECTÁ-LA.** Não foi enviado nenhum reinício. Depois, leia as ranhuras de novo.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Guardado primeiro, como transferência: {file}.',
  'outcome.wayBackOne':
    'O ficheiro desencriptado que contém é a forma de voltar atrás («Escrever imagem desencriptada» na mesma ranhura).',
  'outcome.wayBackMany':
    'Os ficheiros desencriptados que contém são a forma de voltar atrás («Escrever imagem desencriptada» em cada ranhura).',
  'outcome.checkDownloads': 'Confirme que está na pasta de transferências.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — patch de {fromHz} Hz para {toHz} Hz aplicado (firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'A releitura só difere do dump guardado no {count} byte planeado, nos locais e na palavra da soma.',
    many: 'A releitura só difere do dump guardado nos {count} de bytes planeados, nos locais e na palavra da soma.',
    other:
      'A releitura só difere do dump guardado nos {count} bytes planeados, nos locais e na palavra da soma.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'A releitura NÃO difere apenas como planeado: bytes inesperados: {unexpected}; bytes em falta: {count}.',
    many: 'A releitura NÃO difere apenas como planeado: bytes inesperados: {unexpected}; bytes em falta: {count}.',
    other:
      'A releitura NÃO difere apenas como planeado: bytes inesperados: {unexpected}; bytes em falta: {count}.',
  },
  'fpsOutcome.notTaken': 'A releitura não foi feita, por isso o patch não é verificado aqui.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Todas as ranhuras: patch aplicado a {done} de {count}, por esta ordem: {order}.',
    many: 'Todas as ranhuras: patch aplicado a {done} de {count}, por esta ordem: {order}.',
    other: 'Todas as ranhuras: patch aplicado a {done} de {count}, por esta ordem: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'A releitura só difere da ranhura guardada no {count} byte planeado.',
    many: 'A releitura só difere da ranhura guardada nos {count} de bytes planeados.',
    other: 'A releitura só difere da ranhura guardada nos {count} bytes planeados.',
  },
  'fpsEveryOutcome.notTaken': 'A releitura não foi feita.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Parado: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Não escritas: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Nenhuma ranhura desta câmara pode ser escrita a partir daqui.',
  'keys.title': 'Chaves para as escritas',
  'keys.chain': 'Cadeia',
  'keys.chainPlain':
    'a cadeia sem encriptação de 2014: todas as ranhuras são guardadas sem encriptação, por isso nenhuma tem chave',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Escrita como',
  'keys.writtenPlain': 'a imagem tal como está, sem chave, em qualquer ranhura',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Preparada como',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Guardada como',
  'keys.refused': 'Recusada',
  'keys.bootedBank': 'Ranhura de arranque',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank:acc} contém {key:acc}',
  'keys.theBootedBank': 'a ranhura de arranque',
  'keys.unnamedKey': 'uma chave que a página não consegue identificar',
  'keys.bootedBanksKey': 'a chave da ranhura de arranque',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; todas as ranhuras são escritas da mesma forma',

  /* "What these buttons do", below the tab. */
  'how.title': 'O que fazem estes botões',
  'how.read':
    '**Ler ranhuras** e **Dump** não alteram nada na câmara. Antes de mais nada, a câmara é questionada sobre a compilação que executa; uma compilação anterior a {minVersion} é indicada e as suas ranhuras não são lidas.',
  'how.flash':
    '**Escrever imagem desencriptada** recebe uma imagem sem encriptação, encripta-a como o firmware dessa ranhura precisa antes de a preparar e mostra o plano. **Escrever bytes em bruto** prepara o ficheiro exatamente como foi dado. Nenhum dos dois envia nada até confirmar.',
  /* FF = the 16 Hz "FF" build of the Compact; the vendor app = Seek's own phone app. */
  'how.ff':
    'Uma Compact com 1.3.0.8 pode ter a compilação de 8 Hz ou a compilação FF de 16 Hz, e ambas indicam a mesma versão. A própria câmara distingue-as: a sua resposta para cada ranhura diz se a aplicação que responde a aceita, e cada compilação prevê as suas respostas. A imagem de 8 Hz vai para qualquer ranhura. A imagem FF é preparada como a aplicação do fabricante a prepara (a imagem XOR chave A), e a compilação de 16 Hz guarda-a com a chave B, em qualquer ranhura. A página não a recusa: antes de confirmar, o plano diz o que se espera que a câmara faça com ela (a compilação de 8 Hz recusa-a na confirmação da escrita, e uma câmara com outra versão programa-a tal como é enviada e depois não a consegue arrancar). NÃO foi testado se a imagem FF arranca: o corpus não tem nenhum bootloader genuíno para esta compilação. Escrever na ranhura {letterR} pede a confirmação extra, como qualquer escrita na ranhura de recuperação. Uma ranhura **vazia** (a janela do cabeçalho lê-se toda como 0xFF, como {b:loc} de muitas câmaras de 2014) é um estado, não uma avaria. O dump dá os 64 KB em bruto de 0xFF, sem nada para desencriptar, e é escrita exatamente como qualquer outra ranhura; o plano e a confirmação dizem que não é substituído nenhum firmware.',
  /* {copyA}, {copyB}, {copyR} are the three copy buttons' own labels (table.copyTo: "Copy to slot A"…). */
  'how.copy':
    '**{copyA}**, **{copyB}** e **{copyR}** numa linha de ranhura escrevem o firmware que essa ranhura contém, tal como esta leitura o desencriptou, na outra ranhura, seja o que for que ela contenha agora. A imagem é preparada como qualquer imagem desencriptada, por isso o plano e a confirmação são os mesmos que para um ficheiro. **Restaurar de cópia de segurança completa** recebe um .bin (uma imagem completa da flash de 4 MB, como uma leitura por J-Link) ou um .zip que contenha uma (um ficheiro de execução do Preserve, ou o zip que «Dump e desencriptação 4.x/Nano» ou «Dump de todos os seletores» guarda), extrai dele esta ranhura, desencripta-a e mostra o plano; se a cópia de segurança parecer ser de outra câmara ou de outro firmware, o plano indica-o. Uma ranhura que esteja vazia na cópia de segurança, ou que o dump não tenha lido, não pode ser restaurada por uma escrita, e a página indica-o.',
  'how.fps':
    '**Passar a N FPS** numa linha de ranhura altera a imagem dessa ranhura para uma taxa de fotogramas mais alta, e **Passar todas as ranhuras a N FPS** faz o mesmo em todas as ranhuras em que o patch está disponível, numa só confirmação, com a ranhura de arranque atual em último lugar. Para uma ranhura em que não está disponível, a página diz porquê.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Cada escrita guarda primeiro a sua ranhura**: a ranhura é lida de novo e guardada num único zip transferido, com um nome que inclui a hora, o número de série da câmara, o firmware, a ranhura e a escrita (por exemplo `{example}`), e que contém a ranhura tal como está guardada, a sua imagem desencriptada e uma nota sobre o que é cada ficheiro. A escrita espera até a transferência ter começado. O browser não avisa quando uma transferência chega ao disco, por isso veja a pasta de transferências. Para voltar atrás, escreva o ficheiro desencriptado do zip com **Escrever imagem desencriptada**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Uma escrita apaga uma ranhura de 64 KB e programa-a. O bootloader em `{address}` e a configuração de arranque nunca são escritos aqui, e não há nenhum controlo para escolher a ranhura ativa. A ranhura só passa a ter efeito depois de a câmara ser desconectada e voltar a ser conectada.',
} satisfies Translation<'slots'>;

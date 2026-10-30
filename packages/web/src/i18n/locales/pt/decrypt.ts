/**
 * Namespace `decrypt`, português europeu (pt), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': 'Nenhum ficheiro escolhido.',
  'status.reading': 'A ler o ficheiro...',
  'status.notUsable': 'Não é um dump utilizável.',
  'status.building': 'A criar o arquivo...',
  'status.nothingDecrypted':
    'Nenhuma imagem desencriptada — veja o motivo no registo. O manifesto está nas suas transferências.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Concluído — {done}/{count} ranhura desencriptada. Veja as suas transferências.',
    many: 'Concluído — {done}/{count} de ranhuras desencriptadas. Veja as suas transferências.',
    other: 'Concluído — {done}/{count} ranhuras desencriptadas. Veja as suas transferências.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Desencriptar um dump que já tem',
  'offline.description': 'Um dump completo da flash, desencriptado ranhura a ranhura.',
  'offline.intro':
    'O passo 2 do separador 4.x/Nano já desencripta tudo o que lê, por isso só precisa disto se a imagem da flash veio de outro lado — uma execução anterior, J-Link ou um programador SPI. O ficheiro é lido localmente e nunca é enviado. **Esta parte funciona em todos os browsers**, incluindo o Safari e o iOS, porque não precisa de acesso USB.',
  'offline.actions': 'Ações de desencriptação offline',
  'offline.choose': 'Escolher ficheiro de dump…',
  'offline.panel': 'Desencriptação offline',
  'offline.detectedTitle': 'Família de firmware detetada',
  'offline.detectedIntro':
    'Não há câmara ligada, por isso a família é pontuada a partir das imagens do próprio ficheiro. A chave é sempre deduzida do texto cifrado de cada ranhura; isto só serve para dar nome à família de firmware no relatório.',
  'offline.scoreBasis': 'a partir das imagens do ficheiro',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Desencriptar uma ranhura de firmware',
  'slot.description': 'Uma ranhura, a partir de um ficheiro: 64 KB, tal como a câmara a guarda.',
  'slot.intro':
    'Escolha um ficheiro com uma ranhura de firmware — 65 536 bytes, tal como o dump de uma ranhura no separador <link>{tab}</link> a guarda, ou os 64 KB no endereço de uma ranhura num dump completo da flash. A página encontra a chave a partir dos próprios bytes da ranhura, desencripta a imagem e disponibiliza-a para transferência, mostrando a chave, o tamanho e o SHA-256. Não usa câmara, por isso funciona sem nada conectado.',
  'slot.refusedIntro':
    'Um ficheiro que não seja uma ranhura, que não contenha nenhuma imagem de firmware ou que não se desencripte é recusado, com o motivo. Uma ranhura apagada é indicada como tal e não tem nada para desencriptar.',
  'slot.actions': 'Ações do ficheiro de ranhura',
  'slot.choose': 'Escolher ficheiro de ranhura…',
  'slot.decrypting': 'A desencriptar {file} …',
  'slot.unreadable': 'Não foi possível ler o ficheiro.',
  'slot.notDecrypted':
    'Não desencriptado: {file} não é uma ranhura de firmware que esta página consiga desencriptar.',
  'slot.nothingWritten':
    'Não foi escrito nada em lado nenhum. Escolha um ficheiro de ranhura de 64 KB, ou um dump completo na secção acima.',
  'slot.erased': '{file} é uma ranhura apagada.',
  'slot.resultTitle': 'Ranhura de firmware desencriptada',
  'slot.file': 'Ficheiro',
  'slot.fileSize': 'Tamanho do ficheiro',
  'slot.fileSha': 'SHA-256 do ficheiro',
  'slot.imageVersion': 'Versão da imagem',
  'slot.imageSize': 'Tamanho da imagem',
  'slot.imageSha': 'SHA-256 da imagem',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Soma de verificação',
  'slot.notComputed': 'não calculada para esta forma',
  'slot.family': 'Família',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (detetada a partir da imagem)',
  'slot.familyMismatch':
    '{name} — a soma não é o valor de aceitação desta família, por isso o bootloader não aceitaria a imagem tal como está',
  'slot.unknown': 'desconhecida',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Chave',
  'slot.keyPlain':
    'nenhuma: a ranhura guarda a imagem sem encriptação (a cadeia sem encriptação de 2014)',
  'slot.keyFfB': 'Chave B do par 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Guardada como',
  'slot.storedAsFfB':
    'a imagem XOR o fluxo de chave da chave B, com a janela do cabeçalho inalterada',
  'slot.keyNone': 'nenhuma',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Forma da chave',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — a própria imagem contém esta forma uma única vez, o que a identifica',
  'slot.keyFormDefault':
    '{k} — nenhuma forma aparece uma única vez na imagem, por isso é mostrado o valor predefinido da família',
  'slot.resultActions': 'Ações da imagem desencriptada',
  'slot.download': 'Transferir {file}',
  'slot.downloadFallback': 'a imagem desencriptada',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Detetada',
  'detection.score': 'Pontuação',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} de 1.00, {basis}',
  'detection.readAs': 'Lida como',
  'detection.summary': 'Resumo',
  'detection.why': 'Porquê:',
  'detection.ambiguous':
    '**Os indícios não chegaram para decidir que família é esta.** Ou a vencedora não pontuou melhor do que a alternativa genérica, ou a segunda ficou demasiado perto para se decidir. A desencriptação não é afetada — a chave é sempre deduzida do texto cifrado —, mas a família indicada no relatório, e tudo o que dela depende, é uma suposição.',
} satisfies Translation<'decrypt'>;

/**
 * Namespace `shared`, português europeu (pt), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: what several tabs share: components/RunPanel.tsx, Section.tsx, Panel.tsx,
 * KeyValue.tsx, HexBlock.tsx, components/ui/*, hooks/useRunner.ts, useReporter.ts, useDevice.ts,
 * useConnectionTest.ts, lib/camera-lock.ts, download.ts, backup-save.ts, hints.ts, family-line.ts,
 * identify.ts, unlock-seat.ts, webusb.ts, usb-adapter.ts, and components/DeviceInfoPanel.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* RunPanel: the bar, status line and log every long operation has. {label} is the panel's name. */
  'runPanel.percent': '{value}%',
  'runPanel.progressLabel': '{label}: progresso',
  'runPanel.logLabel': '{label}: registo',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} linha anterior removida',
    many: '… {count} de linhas anteriores removidas',
    other: '… {count} linhas anteriores removidas',
  },
  'runPanel.lineCount': {
    one: '{count} linha',
    many: '{count} de linhas',
    other: '{count} linhas',
  },

  /* Status lines several panels set. */
  'status.idle': 'Em espera.',
  'status.cancelled': 'Cancelado.',
  'status.cancelling': 'A cancelar …',
  'status.failedSeeLog': 'Falhou — veja o registo acima.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'A câmara está a ser usada noutro separador ou noutra janela — termine ou feche primeiro o que está aberto lá.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote':
    'O zip é transferido automaticamente, antes de qualquer envio. O browser não avisa quando uma transferência chega ao disco, por isso confirme que o zip está na pasta de transferências antes de contar com ele.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Nenhum dispositivo selecionado.',
  'device.disconnected': 'Dispositivo desconectado.',
  'device.revoked': 'Permissão revogada.',
  'device.unknownProduct': 'produto desconhecido',
  'device.unknownVendor': 'fabricante desconhecido',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Em Linux, a câmara precisa de uma regra udev antes de o browser a poder abrir:\n\n{rule}\n\nDepois, desconecte a câmara e volte a conectá-la. As versões Snap e Flatpak do Chromium ficam muitas vezes isoladas dos dispositivos USB; a versão .deb ou .rpm é a fiável.',
  'hint.windows':
    'O Windows precisa de ter o controlador WinUSB associado à câmara antes de qualquer browser lhe conseguir aceder. Use o Zadig (https://zadig.akeo.ie/): Options → List All Devices, escolha a entrada com o nome da sua câmara — por exemplo «CompactPRO FF» —, selecione WinUSB e clique em Replace Driver.',
  'hint.holding':
    'Outro programa ou um controlador do sistema está a ocupar a câmara — só um processo de cada vez pode ocupar a interface USB. Feche tudo o que comunica com ela e depois desconecte a câmara e volte a conectá-la.',
  'hint.recipientFallback':
    'Ou defina recipient como «device» nas opções de leitura, o que não precisa de reservar a interface.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid': 'Abra «Opções» e veja a nota sob os campos para cada intervalo.',
  'hint.usbTimeout':
    'A câmara aceitou o pedido e nunca respondeu. Desconecte-a e volte a conectá-la; depois experimente um chunk mais pequeno (64 é o valor que funciona em todo o lado).',
  'hint.usbStalled':
    'A câmara rejeitou o pedido. Normalmente isto significa que o firmware dela não o suporta. A página pergunta à câmara qual é a sua família antes de ler o que quer que seja, por isso os pedidos que continuam a ser rejeitados foram feitos para a família que a própria câmara indicou. Veja a versão do firmware no separador Informação.',
  'hint.usbNotOpen':
    'Outro programa ou um controlador do sistema está a ocupar a câmara. Feche-o, ou defina recipient como «device» nas opções de leitura, o que não precisa de reservar a interface.',
  'hint.usbTransferFailed': 'Desconecte a câmara e volte a conectá-la; depois tente de novo.',
  'hint.deviceMode':
    'A câmara não quis sair do modo de imagem. Desconecte-a, espere que se desligue por completo e volte a conectá-la.',
  'hint.deviceWindow':
    'O mapa de seletores que esta família usa não correspondeu à câmara. No separador 4.x/Nano, abra «Opções» e execute «Dump de todos os seletores» para ver o que a câmara expõe de facto.',
  'hint.deviceVersionUnknown':
    'Não foi enviado nada que pudesse alterar a câmara. Desconecte-a, volte a conectá-la, deixe-a terminar o arranque e tente de novo; uma câmara que indica a versão do firmware é lida normalmente.',
  'hint.imageMalformed': 'O ficheiro não é uma imagem de firmware Seek desencriptada.',
  'hint.imageUnsupported': 'Esta imagem não pode ser preparada para a câmara tal como está.',
  'hint.imageKeyTable':
    'A imagem não tem o par de chaves que o nome do ficheiro indica. Use o ficheiro desencriptado exatamente como o dump o escreveu, incluindo o nome.',
  'hint.flashRefused': 'Não foi escrito nada na câmara.',
  'hint.familyUnsupported':
    'Não foi lido nem escrito nada. Cada separador cobre um intervalo de versões de firmware: as câmaras 0.x e 1.x vão para «Dump e desencriptação 0.x/1.x 2014/2016», as câmaras 4.x e Nano para «Dump e desencriptação 4.x/Nano». O separador Informação indica qual é o separador da câmara.',
  'hint.firmwareTooOld':
    'Nenhuma família de firmware consegue ler esta compilação aqui: o firmware não tem resposta de leitura para o comando com que este separador lê a flash, por isso não lhe foi enviado nada cuja resposta pudesse ser mal lida. Uma Compact com 0.7.0.7 ou 0.7.0.8 pode ser lida em «Dump e desencriptação 0.x/1.x 2014/2016». Um dump feito com um programador SPI ou por SWD/J-Link pode ainda ser desencriptado nesta página, em «Desencriptar ficheiro/ranhura».',
  'hint.powerCycle':
    'Neste assistente: desconecte a câmara e volte a conectá-la, prima «Conectar dispositivo» e escolha-a; depois inicie de novo o mesmo passo. A execução continua carregada aqui — não há nada para retomar.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Firmware em execução',
  'deviceInfo.version': 'Versão',
  'deviceInfo.family': 'Família de firmware',
  'deviceInfo.build': 'Compilação',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Plataforma',
  'deviceInfo.serial': 'Número de série',
  'deviceInfo.usbLink': 'Ligação USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Config. de arranque',
  'deviceInfo.bootedFrom': 'Ranhura de arranque',
  'deviceInfo.nextStart': 'Próximo arranque',
  'deviceInfo.upgradeTarget': 'Destino da atualização (a da própria câmara)',
  'deviceInfo.bankAt': '{bank} em {address}',
  'deviceInfo.perDeviceKey': 'Chave própria do dispositivo',
  'deviceInfo.notProgrammed': 'não programada — a câmara recorre à chave B',
  'deviceInfo.keysTitle': 'Chaves lidas desta câmara',
  'deviceInfo.foundAt': 'Encontrada em',
  'deviceInfo.flashOffset': 'deslocamento {offset} na flash',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Chave A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Chave B',
  'deviceInfo.keysConfirmed':
    'Confirmadas pela correspondência com o estado do fluxo de chave de uma ranhura, recuperado do próprio texto cifrado. Um envio é preparado para que cada ranhura o guarde com a chave de armazenamento do bootloader ({storeKey}), ou com a chave própria da ranhura de arranque quando a chave de armazenamento da aplicação não é essa.',
  'deviceInfo.keysDecrypted':
    'Cada ranhura foi desencriptada no browser: o seu fluxo de chave foi deduzido a partir dos seus próprios vetores de reset, que se sabe serem zero. Desencriptar não é o mesmo que arrancar: o bootloader só experimenta {storeKey:acc} e a chave A, por isso uma ranhura escrita com qualquer outra chave tem a soma de verificação perfeita e mesmo assim é ignorada. Não foi escrito nada.',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks:ins} contém uma imagem de firmware válida, encriptada com uma chave que o bootloader desta câmara não conhece.** A imagem está intacta e a soma de verificação está correta, mas o bootloader só experimenta {storeKey:acc} e a chave A quando verifica uma ranhura, por isso ignora-a e arranca a partir de outra.',
    many: '**Cada uma destas ranhuras contém uma imagem de firmware válida, encriptada com uma chave que o bootloader desta câmara não conhece: {banks}.** As imagens estão intactas e as somas de verificação estão corretas, mas o bootloader só experimenta {storeKey:acc} e a chave A quando verifica uma ranhura, por isso ignora-as e arranca a partir de outra.',
    other:
      '**Cada uma destas ranhuras contém uma imagem de firmware válida, encriptada com uma chave que o bootloader desta câmara não conhece: {banks}.** As imagens estão intactas e as somas de verificação estão corretas, mas o bootloader só experimenta {storeKey:acc} e a chave A quando verifica uma ranhura, por isso ignora-as e arranca a partir de outra.',
  },
  'deviceInfo.orphanIsTarget':
    'É essa a ranhura que uma atualização escreve. A aplicação em execução nesta câmara volta a encriptar com essa chave desconhecida, por isso **escrever através desta página vai produzir outra ranhura que o bootloader não consegue arrancar** — a câmara vai continuar a funcionar a partir {bank:gen}. Escrever a ranhura diretamente com um programador SPI ou por SWD/J-Link é a forma de contornar isto.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'a outra ranhura',
  'deviceInfo.otherBank:acc': 'a outra ranhura',
  'deviceInfo.otherBank:gen': 'da outra ranhura',
  'deviceInfo.otherBank:dat': 'à outra ranhura',
  'deviceInfo.otherBank:loc': 'na outra ranhura',
  'deviceInfo.otherBank:ins': 'A outra ranhura',
} satisfies Translation<'shared'>;

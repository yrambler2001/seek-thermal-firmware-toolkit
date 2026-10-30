/**
 * Namespace `app`, português europeu (pt), translated from the English source: the shell.
 *
 * Owner: phase 1. Covers App.tsx, main.tsx, components/AppHeader.tsx,
 * ThemeSwitch.tsx (+ lib/theme.ts), LanguageSwitch.tsx, lib/routing.ts (tab
 * labels and the document title), SupportBanner.tsx (+ lib/support.ts),
 * UnlockNote.tsx, ConnectSection.tsx and PlatformNotes.tsx.
 *
 * Several of these sentences are pinned word for word by safety-copy.test.tsx.
 */

import type { Translation } from '../../types';

export default {
  /* ---- header ---- */
  title: 'Ferramentas de firmware para Seek Thermal',
  'header.cameraSelected': 'Câmara selecionada',
  'header.noCamera': 'Nenhuma câmara selecionada',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB indisponível',
  'header.github': 'As ferramentas no GitHub',
  'header.tabs': 'Separadores',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Informação',
  'tab.preserve': 'Dump e desencriptação 0.x/1.x 2014/2016',
  'tab.v4': 'Dump e desencriptação 4.x/Nano',
  'tab.decrypt': 'Desencriptar ficheiro/ranhura',
  'tab.slots': 'Gerir ranhuras de firmware',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Firmware Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tema escuro',
  'theme.followsSystem': 'Segue a definição de modo claro ou escuro do sistema',
  'theme.chosenDiffers': 'Escolhido aqui. Mude de novo para seguir a definição do sistema.',
  'theme.chosenSame': 'Escolhido aqui, igual à definição atual do sistema',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Idioma',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Lê a câmara conectada tal como faz o `seek-fw info`: o firmware, a família com que se identifica, como arranca, as chaves e cada ranhura. Indica qual dos outros separadores lhe corresponde e explica em palavras simples para que serve cada separador. **Este separador não escreve nada na memória flash.**',
  'intro.preserve':
    'Para câmaras **0.x e 1.x** (as compilações de 2014 e 2016). Faz uma cópia **completa** da memória flash de 4 MB da câmara — incluindo as partes que um dump normal não alcança — e depois deixa a câmara exatamente como estava. Faz uma cópia de segurança do que consegue ler, aplica por pouco tempo um patch ao firmware para conseguir ler o resto, faz o dump de tudo, repõe o original e verifica-o. Tudo corre localmente no seu browser. **Dois dos passos escrevem na memória flash**, e cada um pede confirmação antes.',
  'intro.v4':
    'Faz uma cópia só de leitura da memória flash SPI de 4 MB de uma câmara **4.x ou Nano** por WebUSB e desencripta as imagens de firmware que encontrar. Tudo corre localmente no seu browser — nada é enviado para lado nenhum. **Só leitura:** este separador não envia nenhum comando de escrita, apagamento, envio, confirmação ou reinício da flash. Uma câmara de outra linha de firmware é recusada antes de qualquer leitura.',
  'intro.decrypt':
    'Desencripta firmware que já tem, neste computador: um dump completo da flash ou uma ranhura de firmware de 64 KB. **Não usa nenhuma câmara**, por isso funciona sem nada conectado e em browsers sem acesso a USB. O ficheiro é lido aqui e nunca é enviado.',
  'intro.slots':
    'Lê as três ranhuras de firmware da câmara — ranhura A, ranhura B e ranhura de recuperação R — e mostra o que cada uma contém, a partir de qual a câmara arranca e o que esta compilação pode fazer com ela, com o firmware em execução e as chaves do dispositivo ao lado. Tudo corre localmente no seu browser. **Este separador escreve na memória flash:** pode escrever uma ranhura a partir de uma imagem desencriptada ou de bytes em bruto, e pede confirmação antes de cada escrita.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**O WebUSB não está disponível em iOS nem iPadOS,** por isso este dispositivo não consegue ler a memória flash de uma câmara.',
  'support.ios.body':
    'O Safari não o implementa, e todos os browsers de iOS são obrigados a usar o WebKit, por isso também o Chrome e o Firefox não o podem disponibilizar aqui. Não há nenhuma opção nem extensão que mude isto. Para fazer o dump de uma câmara, use um computador ou um telemóvel Android com um cabo USB-OTG.',
  'support.noWebUsb.title': '**Este browser não consegue aceder a dispositivos USB.**',
  'support.noWebUsb.body':
    'O WebUSB está disponível no Chrome, Edge, Opera e noutros browsers Chromium em Windows, macOS, Linux e Android. O Firefox e o Safari recusaram ambos implementá-lo.',
  'support.noWebUsb.insecure':
    'Além disso, esta página não está a ser servida por uma ligação segura, o que por si só bloqueia o WebUSB.',
  'support.insecure.title': '**Ligação insegura.** O WebUSB está desativado aqui.',
  'support.insecure.body':
    'Abra esta página por HTTPS ou a partir de `http://localhost`. Um endereço simples de rede local, como `http://192.168.1.10:8000`, não serve.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Pode continuar a usar o separador **{tab}** — funciona inteiramente com um ficheiro que escolher e não precisa de acesso USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Pronto.** Conecte a sua câmara Seek e prima *{connect}*.',
  'support.fileProtocol':
    'Aberta como ficheiro local, por isso o browser não se vai lembrar do dispositivo entre recarregamentos. Isso não faz mal.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Nota: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Conectar',
  'connect.actions': 'Ações do dispositivo',
  'connect.connect': 'Conectar dispositivo',
  'connect.change': 'Mudar de dispositivo',
  'connect.test': 'Testar ligação',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Esquecer dispositivo',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'É apresentado qualquer dispositivo Seek Thermal (fabricante USB `{vendor}`) — Compact, Compact PRO, Nano, etc. Escolha o seu na janela de seleção de dispositivos do browser.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Notas por plataforma',
  'platform.macos':
    'Funciona de imediato no Chrome, no Edge ou em qualquer browser Chromium. Sem instalar controladores, sem direitos de administrador. Primeiro, feche qualquer outro programa que já esteja a comunicar com a câmara — só um processo de cada vez pode ocupar a interface USB.',
  'platform.linux.access':
    'Dê ao seu utilizador acesso ao dispositivo e, depois, desconecte-o e volte a conectá-lo:',
  'platform.linux.sandbox':
    'As versões Snap e Flatpak do Chromium ficam muitas vezes isoladas dos dispositivos USB; a versão `.deb` ou `.rpm` é a fiável.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'O Windows precisa de ter o controlador WinUSB associado à câmara antes de qualquer browser lhe conseguir aceder. Use o <zadig>Zadig</zadig>: *Options → List All Devices*, depois escolha na lista a entrada com o nome da sua câmara — por exemplo `CompactPRO FF` —, selecione **WinUSB** como controlador e clique em Replace Driver. Se a câmara aparecer mais de uma vez, escolha a entrada marcada *(Interface 0)*. Isto retira o dispositivo ao software do fabricante até reverter a alteração no Gestor de Dispositivos (*Desinstalar dispositivo → Eliminar controlador*, e depois volte a conectá-lo).',
  'platform.android':
    'Funciona no Chrome para Android com um cabo USB-OTG, desde que o telemóvel consiga alimentar a câmara pelo USB. O Android dá acesso ao USB através da sua própria janela de permissão. A transferência fica na pasta Transferências, como qualquer outro ficheiro.',
  'platform.ios.name': 'iPhone e iPad',
  'platform.ios.cannot':
    '**Não consegue ler uma câmara**, e isto não vai mudar. O Safari não implementa o WebUSB e, em iOS e iPadOS, todos os browsers — incluindo o Chrome e o Firefox — são obrigados a usar o WebKit, por isso nenhum deles disponibiliza a API. Não há opção, extensão nem aplicação que contorne isto. Para fazer o dump, use um computador ou um telemóvel Android.',
  'platform.ios.decrypt':
    'O desencriptador opcional funciona aqui: desencriptar um dump que já tem não precisa de acesso USB, por isso pode fazê-lo num iPhone ou iPad, ou no Firefox e no Safari num computador.',
} satisfies Translation<'app'>;

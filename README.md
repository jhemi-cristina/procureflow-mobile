# ProcureFlow Mobile

Aplicativo mobile (iOS e Android) do **ProcureFlow**, um sistema de gestão de solicitações de compra com fluxo de aprovação. Consome a mesma [ProcureFlow API](../procureflow-api) usada pelo [ProcureFlow Web](../procureflow-web).

## Funcionalidades

- Login com JWT guardado no **Keychain/Keystore** do aparelho (`expo-secure-store`)
- Sessão restaurada ao abrir o app, com splash screen enquanto carrega
- Logout automático quando o token expira ou a API responde `401`
- Painel com indicadores, solicitações pendentes e recentes
- Lista com busca, filtro por status e "puxar para atualizar"
- Criar e editar rascunhos e enviar para aprovação
- Aprovar ou rejeitar com justificativa (perfis `admin` e `approver`)
- Atualiza os dados quando o app volta para o primeiro plano

## Stack

- **Expo SDK 58** + **React Native 0.88** + **React 19**
- **Expo Router**: navegação baseada em arquivos, com `Stack.Protected` para rotas autenticadas
- **TanStack Query** para cache e sincronização com a API
- **React Hook Form + Zod** para formulários e validação
- **TypeScript** estrito

## Estrutura

```
src/
  app/                    # rotas (cada arquivo é uma tela)
    _layout.tsx           # Stack raiz, splash e rotas protegidas
    login.tsx
    (tabs)/               # navegação por abas: Início, Solicitações, Perfil
    request/[id].tsx      # detalhes, envio e decisão
    request/form.tsx      # modal de criar/editar
  components/             # ui/, requests/, dashboard/, layout/
  contexts/               # AuthContext
  hooks/                  # useAuth, usePurchaseRequests, useRequestStats...
  lib/api/                # cliente HTTP (com timeout) e serviços
  lib/auth/               # sessão no armazenamento seguro
  providers/              # QueryClient + Auth
  theme/                  # design tokens
  types/                  # contratos da API
```

## Como rodar

1. Suba a [ProcureFlow API](../procureflow-api) na porta `3000`.
2. Configure o endereço da API. O celular **não enxerga `localhost`** do computador:

   ```bash
   cp .env.example .env.local
   ```

   | Onde o app roda     | `EXPO_PUBLIC_API_URL`               |
   | ------------------- | ----------------------------------- |
   | Celular (Expo Go)   | `http://<IP-do-PC>:3000/api/v1`     |
   | Emulador Android    | `http://10.0.2.2:3000/api/v1`       |
   | Simulador iOS       | `http://localhost:3000/api/v1`      |

3. Instale e inicie:

   ```bash
   npm install
   npm start
   ```

4. Leia o QR code com o app **Expo Go** (celular na mesma rede Wi-Fi) ou pressione `a` para abrir no emulador Android.

| Script              | Descrição                    |
| ------------------- | ---------------------------- |
| `npm start`         | Inicia o servidor do Expo    |
| `npm run android`   | Abre no emulador Android     |
| `npm run ios`       | Abre no simulador iOS (macOS) |
| `npm run lint`      | ESLint                       |
| `npm run typecheck` | Verificação de tipos         |

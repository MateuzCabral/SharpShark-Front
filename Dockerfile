# Crie este novo arquivo em: SharpShark-Front/Dockerfile

# --- ESTÁGIO 1: Build (com Node.js) ---
FROM node:20-alpine as builder

WORKDIR /app

# Copia package.json e lock
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm install

# Copia o resto do código
COPY . .

# Roda o build (que vai ler a baseURL="/" do axios.ts)
RUN npm run build

# --- ESTÁGIO 2: Produção (com Nginx) ---
FROM nginx:1.27-alpine

# Copia os arquivos do build (da pasta "dist") para a pasta do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a nossa configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
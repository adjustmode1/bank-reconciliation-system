# Sử dụng Node.js Alpine image để giảm kích thước
FROM node:20-alpine AS base

# Cài đặt pnpm globally
RUN npm install -g pnpm

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và pnpm-lock.yaml (nếu có)
COPY package.json pnpm-lock.yaml* ./

# Stage cho dependencies
FROM base AS dependencies

# Cài đặt dependencies
RUN pnpm install --frozen-lockfile

# Stage cho build
FROM base AS build

# Copy dependencies từ stage trước
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Cài đặt pnpm
RUN npm install -g pnpm

# Tạo user non-root cho bảo mật
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Cài đặt chỉ production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application từ build stage
COPY --from=build /app/dist ./dist

COPY .env.production ./
# Thay đổi ownership cho user nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (thường là 3000 cho NestJS)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["pnpm", "start:prod"]
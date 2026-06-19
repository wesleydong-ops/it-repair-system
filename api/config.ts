import path from 'path'

export interface ServerConfig {
  httpPort: number
  httpsPort: number
  staticPath: string
  certPath: string
  dataPath: string
  jwtSecret: string
  nodeEnv: string
  certFileName?: string
  chainFileName?: string
  keyFileName?: string
}

const getConfig = (): ServerConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development'
  
  return {
    httpPort: parseInt(process.env.HTTP_PORT || '8080', 10),
    httpsPort: parseInt(process.env.HTTPS_PORT || (nodeEnv === 'production' ? '4433' : '8443'), 10),
    staticPath: process.env.STATIC_PATH || path.join(__dirname, '../dist'),
    certPath: process.env.CERT_PATH || path.join(__dirname, '../certs'),
    dataPath: process.env.DATA_PATH || path.join(__dirname, '../data'),
    jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
      ? (() => { throw new Error('生产环境必须设置 JWT_SECRET 环境变量') })() 
      : 'dev-only-secret-key'),
    nodeEnv
  }
}

export const config = getConfig()
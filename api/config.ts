import path from 'path'

export interface ServerConfig {
  httpPort: number
  httpsPort: number
  staticPath: string
  certPath: string
  jwtSecret: string
  nodeEnv: string
}

const getConfig = (): ServerConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development'
  
  return {
    httpPort: parseInt(process.env.HTTP_PORT || '8080', 10),
    httpsPort: parseInt(process.env.HTTPS_PORT || (nodeEnv === 'production' ? '4433' : '8443'), 10),
    staticPath: process.env.STATIC_PATH || path.join(__dirname, '../dist'),
    certPath: process.env.CERT_PATH || path.join(__dirname, '../certs'),
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
    nodeEnv
  }
}

export const config = getConfig()
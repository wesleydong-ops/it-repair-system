// 工单状态相关工具函数

export const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'status-pending',
    accepted: 'status-accepted',
    processing: 'status-processing',
    external_pending: 'status-external-pending',
    external_processing: 'status-external-processing',
    external_rejected: 'status-rejected',
    completed: 'status-completed',
    closed: 'status-closed'
  }
  return classes[status] || 'status-pending'
}

export const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待接单',
    accepted: '已接单',
    processing: '处理中',
    external_pending: '外修待处理',
    external_processing: '外修处理中',
    external_rejected: '外修已驳回',
    completed: '已完成',
    closed: '已结案'
  }
  return texts[status] || '未知'
}

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { doctorProfileService } from "../../services/doctorProfileService"

interface Payment {
  _id: string
  patientId: { name: string; email: string }
  appointmentId: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  createdAt: string
}

interface PaymentStats {
  totalEarnings: number
  pendingAmount: number
  totalTransactions: number
  payments: Payment[]
}

export default function PaymentManagement() {
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    pendingAmount: 0,
    totalTransactions: 0,
    payments: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await doctorProfileService.getPayments()
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'refunded': return 'bg-gray-100 text-gray-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment & Earnings</h2>
        <p className="text-text-secondary">View your consultation payments and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-2xl font-bold text-green-700">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-sm text-green-600">Total Earnings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⏳</div>
              <p className="text-2xl font-bold text-yellow-700">${stats.pendingAmount.toFixed(2)}</p>
              <p className="text-sm text-yellow-600">Pending Payments</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-2xl font-bold text-blue-700">{stats.totalTransactions}</p>
              <p className="text-sm text-blue-600">Total Transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">Loading payments...</p>
            </div>
          ) : stats.payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No payments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium">Patient</th>
                    <th className="text-left py-3 px-2 font-medium">Amount</th>
                    <th className="text-left py-3 px-2 font-medium">Method</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.payments.slice(0, 10).map((payment) => (
                    <tr key={payment._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{payment.patientId?.name || 'Unknown'}</p>
                          <p className="text-sm text-text-secondary">{payment.patientId?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-semibold">
                        ${payment.amount.toFixed(2)} {payment.currency}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {payment.paymentMethod}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-text-secondary">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

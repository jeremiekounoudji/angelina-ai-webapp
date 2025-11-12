'use client'

import { useState } from 'react'
import { Button, Input, Card, CardBody, CardHeader, Select, SelectItem, Textarea, Divider } from '@heroui/react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  type: z.enum(['restaurant', 'retail', 'service', 'other']),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  description: z.string().optional(),
})

type CompanyForm = z.infer<typeof companySchema>

interface CompanySetupProps {
  userId: string
  onComplete: () => void
}

const companyTypes = [
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'retail', label: 'Retail' },
  { key: 'service', label: 'Service' },
  { key: 'other', label: 'Other' },
]

export function CompanySetup({ userId, onComplete }: CompanySetupProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      type: 'restaurant',
    },
  })

  const selectedType = watch('type')

  const onSubmit = async (data: CompanyForm) => {
    setLoading(true)
    
    try {
      // Create company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          type: data.type,
          address: data.address || null,
          phone: data.phone || null,
          email: data.email || null,
          description: data.description || null,
        })
        .select()
        .single()

      if (companyError) {
        setError('root', { message: companyError.message })
        return
      }

      // Get current user email
      const { data: { user } } = await supabase.auth.getUser()
      
      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          company_id: companyData.id,
          full_name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          role: 'admin',
        })

      if (userError) {
        setError('root', { message: userError.message })
        return
      }

      onComplete()
    } catch {
      setError('root', { message: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-col gap-3 text-center">
          <h1 className="text-2xl font-bold">Setup Your Company</h1>
          <p className="text-gray-600">Tell us about your business</p>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              {...register('name')}
              label="Company Name"
              placeholder="Enter your company name"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              isRequired
            />

            <Select
              label="Business Type"
              placeholder="Select your business type"
              selectedKeys={selectedType ? [selectedType] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as "restaurant" | "retail" | "service" | "other"
                setValue('type', selected)
              }}
              isRequired
            >
              {companyTypes.map((type) => (
                <SelectItem key={type.key}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>

            <Input
              {...register('email')}
              type="email"
              label="Business Email"
              placeholder="Enter business email (optional)"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <Input
              {...register('phone')}
              label="Phone Number"
              placeholder="Enter phone number (optional)"
              isInvalid={!!errors.phone}
              errorMessage={errors.phone?.message}
            />

            <Textarea
              {...register('address')}
              label="Address"
              placeholder="Enter business address (optional)"
              isInvalid={!!errors.address}
              errorMessage={errors.address?.message}
            />

            <Textarea
              {...register('description')}
              label="Description"
              placeholder="Describe your business (optional)"
              isInvalid={!!errors.description}
              errorMessage={errors.description?.message}
            />

            {errors.root && (
              <p className="text-red-500 text-sm">{errors.root.message}</p>
            )}

            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              Create Company
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FaTimes } from 'react-icons/fa'

interface Establishment {
  id: string
  commune: string
  name: string
  natureEtablissement: string
  gestionnaire: string
  directeur?: string
  contact?: string
  latitude?: number
  longitude?: number
}

interface EstablishmentModalProps {
  isOpen: boolean
  onClose: () => void
  establishment: Establishment | null
}

const validationSchema = Yup.object({
  commune: Yup.string().required('Required'),
  name: Yup.string().required('Required'),
  natureEtablissement: Yup.string().required('Required'),
  gestionnaire: Yup.string().required('Required'),
  directeur: Yup.string(),
  contact: Yup.string(),
  latitude: Yup.number().nullable(),
  longitude: Yup.number().nullable(),
})

export default function EstablishmentModal({
  isOpen,
  onClose,
  establishment,
}: EstablishmentModalProps) {
  const formik = useFormik({
    initialValues: {
      commune: establishment?.commune || '',
      name: establishment?.name || '',
      natureEtablissement: establishment?.natureEtablissement || '',
      gestionnaire: establishment?.gestionnaire || '',
      directeur: establishment?.directeur || '',
      contact: establishment?.contact || '',
      latitude: establishment?.latitude || null,
      longitude: establishment?.longitude || null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (establishment) {
          // Update existing establishment
          // API call here
          console.log('Updating establishment:', values)
        } else {
          // Create new establishment
          // API call here
          console.log('Creating new establishment:', values)
        }
        onClose()
      } catch (error) {
        console.error('Error saving establishment:', error)
      }
    },
  })

  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: {
          commune: establishment?.commune || '',
          name: establishment?.name || '',
          natureEtablissement: establishment?.natureEtablissement || '',
          gestionnaire: establishment?.gestionnaire || '',
          directeur: establishment?.directeur || '',
          contact: establishment?.contact || '',
          latitude: establishment?.latitude || null,
          longitude: establishment?.longitude || null,
        },
      })
    }
  }, [isOpen, establishment])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {establishment ? 'Modifier' : 'Ajouter'} un établissement
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nom
            </label>
            <input
              type="text"
              id="name"
              {...formik.getFieldProps('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="commune"
              className="block text-sm font-medium text-gray-700"
            >
              Commune
            </label>
            <input
              type="text"
              id="commune"
              {...formik.getFieldProps('commune')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
            {formik.touched.commune && formik.errors.commune ? (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.commune}
              </div>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="natureEtablissement"
              className="block text-sm font-medium text-gray-700"
            >
              Nature de l'établissement
            </label>
            <input
              type="text"
              id="natureEtablissement"
              {...formik.getFieldProps('natureEtablissement')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
            {formik.touched.natureEtablissement &&
            formik.errors.natureEtablissement ? (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.natureEtablissement}
              </div>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="gestionnaire"
              className="block text-sm font-medium text-gray-700"
            >
              Gestionnaire
            </label>
            <input
              type="text"
              id="gestionnaire"
              {...formik.getFieldProps('gestionnaire')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
            {formik.touched.gestionnaire && formik.errors.gestionnaire ? (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.gestionnaire}
              </div>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="directeur"
              className="block text-sm font-medium text-gray-700"
            >
              Directeur
            </label>
            <input
              type="text"
              id="directeur"
              {...formik.getFieldProps('directeur')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-gray-700"
            >
              Contact
            </label>
            <input
              type="text"
              id="contact"
              {...formik.getFieldProps('contact')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="latitude"
                className="block text-sm font-medium text-gray-700"
              >
                Latitude
              </label>
              <input
                type="number"
                step="any"
                id="latitude"
                {...formik.getFieldProps('latitude')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="longitude"
                className="block text-sm font-medium text-gray-700"
              >
                Longitude
              </label>
              <input
                type="number"
                step="any"
                id="longitude"
                {...formik.getFieldProps('longitude')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {establishment ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

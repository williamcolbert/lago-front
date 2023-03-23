import { forwardRef, RefObject } from 'react'
import { gql } from '@apollo/client'
import { useFormik } from 'formik'
import styled from 'styled-components'
import { object, number } from 'yup'
import { InputAdornment } from '@mui/material'

import { Dialog, Button, DialogRef } from '~/components/designSystem'
import { TextInputField } from '~/components/form'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useUpdateVatRateOrganizationMutation, LagoApiError } from '~/generated/graphql'
import { theme } from '~/styles'
import { addToast } from '~/core/apolloClient'

gql`
  mutation updateVatRateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      id
      billingConfiguration {
        id
        vatRate
      }
    }
  }
`
export interface EditOrganizationVatRateDialogRef extends DialogRef {}

interface EditOrganizationVatRateDialogProps {
  vatRate: number
}

export const EditOrganizationVatRateDialog = forwardRef<
  DialogRef,
  EditOrganizationVatRateDialogProps
>(({ vatRate }: EditOrganizationVatRateDialogProps, ref) => {
  const { translate } = useInternationalization()
  const [updateVatRate] = useUpdateVatRateOrganizationMutation({
    context: { silentErrorCodes: [LagoApiError.UnprocessableEntity] },
    onCompleted() {
      addToast({
        message: translate('text_62728ff857d47b013204c86f'),
        severity: 'success',
      })
      ;(ref as unknown as RefObject<DialogRef>)?.current?.closeDialog()
    },
  })
  const formikProps = useFormik<{ vatRate?: number }>({
    initialValues: {
      vatRate: vatRate ?? undefined,
    },
    validationSchema: object().shape({
      vatRate: number()
        .min(0, 'text_6272a16eea94bd01089abaa7')
        .max(100, 'text_6272a16eea94bd01089abaa7')
        .required('text_6272a16eea94bd01089abaa7'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateVatRate({
        variables: { input: { billingConfiguration: { vatRate: Number(values.vatRate) } } },
      })
    },
  })

  return (
    <Dialog
      ref={ref}
      title={translate('text_62728ff857d47b013204c76c')}
      description={translate('text_62728ff857d47b013204c77a')}
      actions={({ closeDialog }) => (
        <>
          <Button
            variant="quaternary"
            onClick={() => {
              closeDialog()
              formikProps.resetForm()
            }}
          >
            {translate('text_62728ff857d47b013204c7e4')}
          </Button>
          <Button
            variant="primary"
            // @ts-ignore
            disabled={formikProps.values.vatRate === ''}
            onClick={async () => {
              formikProps.handleSubmit()
            }}
          >
            {translate('text_62728ff857d47b013204c7fa')}
          </Button>
        </>
      )}
    >
      <Content>
        <TextInputField
          name="vatRate"
          formikProps={formikProps}
          label={translate('text_62728ff857d47b013204c7a2')}
          // value={localVatRate}
          // error={mutationError}
          beforeChangeFormatter="positiveNumber"
          // onChange={(value) => {
          //   !!mutationError && setMutationError(undefined)
          //   setLocalVatRate(Number(value))
          // }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {translate('text_62728ff857d47b013204c7ce')}
              </InputAdornment>
            ),
          }}
        />
      </Content>
    </Dialog>
  )
})

const Content = styled.div`
  margin-bottom: ${theme.spacing(8)};
`

EditOrganizationVatRateDialog.displayName = 'forwardRef'

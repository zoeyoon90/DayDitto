import InquiryDetailContainer from '@/domain/Inquiry/InquiryDetailContainer'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params
  return <InquiryDetailContainer id={id} />
}

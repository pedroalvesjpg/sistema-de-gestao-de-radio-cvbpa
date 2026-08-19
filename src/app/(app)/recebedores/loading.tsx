import {
  HeaderSkeleton,
  TabelaSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton comContador comAcao />
      <TabelaSkeleton colunas={6} linhas={6} />
    </div>
  );
}

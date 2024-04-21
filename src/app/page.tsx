import Image from "next/image";
import type { Metadata } from "next";

interface Regjeringsmedlem {
  id: string;
  fornavn: string;
  etternavn: string;
  foedselsdato: string;
  kjoenn: number;
  tittel: string;
  verv: string;
  departement: string;
  parti: {
    id: string;
    navn: string;
  };
}

function parseDate(date: string) {
  const matches = date.match(/\((-?\d+)([+-]\d+)\)/);

  if (!matches) return;

  const timestamp = parseInt(matches[1]);
  const timezoneOffset =
    parseInt(matches[2].slice(0, 3)) * 60 + parseInt(matches[2].slice(3));

  return new Date(timestamp + timezoneOffset * 60000);
}

function calculateAge(dateOfBirth?: Date) {
  if (!dateOfBirth) return;
  const today = new Date();
  const age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const m = today.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < dateOfBirth.getUTCDate())) {
    return age - 1;
  }
  return age;
}

export const metadata: Metadata = {
  title: "Hvem er i regjeringen?",
};

export default async function Home() {
  const res = await fetch(
    "https://data.stortinget.no/eksport/regjering?format=json",
    { cache: "no-store" },
  ).then((res) => res.json());

  const medlemer: Regjeringsmedlem[] = res.regjeringsmedlemmer_liste;

  return (
    <div className="mx-auto container max-w-4xl">
      <h1 className="text-4xl text-center m-8">Hvem er i regjeringen?</h1>
      <div className="grid m-4 gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {medlemer.map((m) => {
          const dateOfBirth = parseDate(m.foedselsdato);
          return (
            <div key={m.id} className="flex flex-col text-center">
              <Image
                src={`https://data.stortinget.no/eksport/personbilde?personid=${m.id}&storrelse=stort&erstatningsbilde=true`}
                width={500}
                height={668}
                alt={`${m.fornavn} ${m.etternavn}`}
                className="self-center"
              />
              <div className="text-lg">
                {m.fornavn} {m.etternavn}
              </div>
              <div>
                {dateOfBirth?.toLocaleString("no", {
                  dateStyle: "medium",
                })}{" "}
                ({calculateAge(dateOfBirth)})
              </div>
              <div>{m.tittel}</div>
              <div className="text-xs">{m.departement}</div>
              <div className="text-sm">{m.parti.navn}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

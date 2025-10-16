import { CheckCircle2, MailCheck, Shield } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage: "url(/images/landing/grain.png)",
          backgroundSize: "100px 100px",
          mixBlendMode: "overlay",
        }}
      />
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <Card className="relative overflow-hidden border border-white/10 bg-black/40 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="space-y-4 p-6 sm:p-8 md:p-10">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex-shrink-0">
                <CheckCircle2
                  className="size-10 text-emerald-400 sm:size-12 md:size-14"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                  Thank you for signing up
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 pt-2 text-base sm:justify-start sm:text-lg md:text-xl">
                  <MailCheck
                    className="size-5 text-muted-foreground sm:size-6"
                    aria-hidden="true"
                  />
                  Check your email to confirm your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6 sm:p-8 md:p-10">
            <div className="space-y-4">
              <p className="text-center text-base leading-relaxed text-muted-foreground sm:text-left sm:text-lg md:text-xl">
                A confirmation link was sent to the email address provided. Open the message and
                click the link to activate your account before signing in.
              </p>

              <div className="flex items-center justify-center gap-3 rounded-lg bg-white/5 p-4 text-sm text-muted-foreground sm:justify-start sm:text-base md:text-lg">
                <Shield className="size-5 flex-shrink-0 sm:size-6" aria-hidden="true" />
                <span>Verification helps keep your account secure.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute -z-10 h-screen w-screen overflow-hidden">
        <svg viewBox="0 0 2596 2199" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1039_1231)">
            <g filter="url(#filter0_f_1039_1231)">
              <path
                opacity="0.65"
                d="M2143 1234.99V965.009C2143 572.882 1825.12 255 1432.99 255H1163.01C770.882 255 453 572.882 453 965.009V1234.99C453 1627.12 770.882 1945 1163.01 1945H1432.99C1825.12 1945 2143 1627.12 2143 1234.99Z"
                fill="#3C3C3C"
              />
            </g>
            <g filter="url(#filter1_f_1039_1231)">
              <path
                opacity="0.65"
                d="M2126 1220.25V984.684C2126 592.557 1808.12 274.675 1415.99 274.675H1182.41C790.282 274.675 472.4 592.557 472.4 984.684V1220.25C472.4 1612.37 790.282 1930.25 1182.41 1930.25H1415.99C1808.12 1930.25 2126 1612.37 2126 1220.25Z"
                fill="#303030"
              />
            </g>
            <g filter="url(#filter2_f_1039_1231)">
              <path
                d="M2018 1112.07V1092.87C2018 700.748 1700.12 382.866 1307.99 382.866H1290.21C898.081 382.866 580.199 700.748 580.199 1092.87V1112.07C580.199 1504.19 898.081 1822.08 1290.21 1822.08H1307.99C1700.12 1822.08 2018 1504.19 2018 1112.07Z"
                fill="#D5FDB9"
              />
              <path
                d="M2057 1118.61V1086.31C2057 694.186 1739.12 376.304 1346.99 376.304H1251.21C859.081 376.304 541.199 694.186 541.199 1086.31V1118.61C541.199 1510.74 859.081 1828.62 1251.21 1828.62H1346.99C1739.12 1828.62 2057 1510.74 2057 1118.61Z"
                fill="#E4F9FF"
              />
              <path
                opacity="0.65"
                d="M2018 1112.07V1092.87C2018 700.748 1700.12 382.866 1307.99 382.866H1290.21C898.081 382.866 580.199 700.748 580.199 1092.87V1112.07C580.199 1504.19 898.081 1822.08 1290.21 1822.08H1307.99C1700.12 1822.08 2018 1504.19 2018 1112.07Z"
                fill="#6C6C6C"
              />
            </g>
            <g filter="url(#filter3_f_1039_1231)">
              <path
                d="M1858 1167.68V1049.18C1858 782.346 1641.69 566.034 1374.85 566.034H1223.22C956.382 566.034 740.07 782.346 740.07 1049.18V1167.68C740.07 1434.51 956.382 1650.82 1223.22 1650.82H1374.85C1641.69 1650.82 1858 1434.51 1858 1167.68Z"
                fill="#A3A3A3"
              />
            </g>
            <g filter="url(#filter4_f_1039_1231)">
              <path
                d="M1779 1195.68V979.818C1779 714.061 1563.56 498.622 1297.8 498.622C1032.05 498.622 816.609 714.061 816.609 979.818V1195.68C816.609 1461.43 1032.05 1676.87 1297.8 1676.87C1563.56 1676.87 1779 1461.43 1779 1195.68Z"
                fill="#131312"
              />
            </g>
          </g>
          <defs>
            <filter
              id="filter0_f_1039_1231"
              x="173"
              y="-25"
              width="2250"
              height="2250"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="140" result="effect1_foregroundBlur_1039_1231" />
            </filter>
            <filter
              id="filter1_f_1039_1231"
              x="352.4"
              y="154.675"
              width="1893.6"
              height="1895.58"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="60" result="effect1_foregroundBlur_1039_1231" />
            </filter>
            <filter
              id="filter2_f_1039_1231"
              x="425.199"
              y="260.304"
              width="1747.8"
              height="1684.32"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="58" result="effect1_foregroundBlur_1039_1231" />
            </filter>
            <filter
              id="filter3_f_1039_1231"
              x="510.07"
              y="336.034"
              width="1577.93"
              height="1544.79"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="115" result="effect1_foregroundBlur_1039_1231" />
            </filter>
            <filter
              id="filter4_f_1039_1231"
              x="586.608"
              y="268.622"
              width="1422.39"
              height="1638.25"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="115" result="effect1_foregroundBlur_1039_1231" />
            </filter>
            <clipPath id="clip0_1039_1231">
              <rect width="2596" height="2199" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
}

FROM mhart/alpine-node:11.14
WORKDIR /app
COPY tsconfig.json package.json package-lock.json ./
COPY src /app/src/
RUN npm ci && NODE_ENV=production npm run build

FROM mhart/alpine-node:11.14
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --prod
ARG PS_VERSION=6.2.0
ARG PS_PACKAGE=powershell-${PS_VERSION}-linux-alpine-x64.tar.gz
ARG PS_PACKAGE_URL=https://github.com/PowerShell/PowerShell/releases/download/v${PS_VERSION}/${PS_PACKAGE}
ARG PS_INSTALL_VERSION=6

# Download the Linux tar.gz and save it
ADD ${PS_PACKAGE_URL} /tmp/linux.tar.gz

# define the folder we will be installing PowerShell to
ENV PS_INSTALL_FOLDER=/opt/microsoft/powershell/$PS_INSTALL_VERSION

# Create the install folder
RUN mkdir -p ${PS_INSTALL_FOLDER}

# Unzip the Linux tar.gz
RUN tar zxf /tmp/linux.tar.gz -C ${PS_INSTALL_FOLDER}

FROM alpine:3.8
ENV NODE_ENV=production
ARG PS_INSTALL_VERSION=6
ENV PS_INSTALL_FOLDER=/opt/microsoft/powershell/$PS_INSTALL_VERSION \
  \
  # Define ENVs for Localization/Globalization
  DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
  LC_ALL=en_US.UTF-8 \
  LANG=en_US.UTF-8 \
  # set a fixed location for the Module analysis cache
  PSModuleAnalysisCachePath=/var/cache/microsoft/powershell/PSModuleAnalysisCache/ModuleAnalysisCache
COPY --from=1 /app/node_modules/ /app/node_modules/
COPY --from=1 /usr/bin/node /usr/bin/
COPY --from=1 /usr/lib/node_modules/ /usr/lib/node_modules/
COPY --from=1 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
COPY --from=1 ["/opt/microsoft/powershell", "/opt/microsoft/powershell"]
WORKDIR /app
COPY --from=0 /app/dist/ ./dist/
COPY package.json /app/
RUN apk add --no-cache \
  ca-certificates \
  less \
  \
  # PSReadline/console dependencies
  ncurses-terminfo-base \
  \
  # .NET Core dependencies
  krb5-libs \
  libgcc \
  libintl \
  libssl1.0 \
  libstdc++ \
  tzdata \
  userspace-rcu \
  zlib \
  icu-libs \
  lttng-ust \
  \
  # Create the pwsh symbolic link that points to powershell
  && ln -s ${PS_INSTALL_FOLDER}/pwsh /usr/bin/pwsh \
  # Give all user execute permissions and remove write permissions for others
  && chmod a+x,o-w ${PS_INSTALL_FOLDER}/pwsh \
  # intialize powershell module cache
  && pwsh \
  -NoLogo \
  -NoProfile \
  -Command " \
  \$ErrorActionPreference = 'Stop' ; \
  \$ProgressPreference = 'SilentlyContinue' ; \
  while(!(Test-Path -Path \$env:PSModuleAnalysisCachePath)) {  \
  Write-Host "'Waiting for $env:PSModuleAnalysisCachePath'" ; \
  Start-Sleep -Seconds 6 ; \
  }"

RUN pwsh -Command Install-Module -Name VMware.PowerCLI -Force
CMD NODE_ENV=production node /app/dist/index.js

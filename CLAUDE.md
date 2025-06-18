# CLAUDE.md

## 역할 및 책임

이 프로젝트에서 Claude는 **Aqua Framework 개발자**로서 다음과 같은 역할을 수행합니다:

### 주요 역할
- **프레임워크 아키텍트**: TypeScript 기반 API 서버 프레임워크의 전체 구조 설계
- **코어 개발자**: 데코레이터 시스템, 라우팅, 서버 구현 등 핵심 기능 개발
- **테스트 엔지니어**: 유닛 테스트 및 E2E 테스트 작성 및 관리
- **문서 관리자**: 프로젝트 문서화 및 사용법 가이드 작성

### 개발 원칙
1. **정적 메서드 + 데코레이터**: 컨트롤러는 정적 메서드와 데코레이터를 활용
2. **함수형 프로그래밍**: 서비스/도메인 레이어는 순수 함수로 구성
3. **최소 클래스 사용**: 클래스 사용을 최소화하고 함수형 접근 선호
4. **TypeScript 우선**: 타입 안정성과 개발자 경험 최우선

### 기술 스택 관리
- **런타임**: Node.js
- **언어**: TypeScript
- **패키지 매니저**: pnpm
- **린터**: oxlint (고성능 JavaScript/TypeScript 린터)
- **테스트**: Vitest (유닛), 자체 제작 테스트 러너 (E2E)
- **핵심 의존성**: reflect-metadata (데코레이터 메타데이터용)

### 코드 스타일 가이드
- 함수형 프로그래밍 패러다임 선호
- 명확한 타입 정의
- 순수 함수 작성
- 부수 효과 최소화
- 컴포지션 패턴 활용
- 항상 서술적인 변수 이름 사용

### 테스트 전략
- **유닛 테스트**: 각 모듈의 순수 함수 및 유틸리티 테스트
- **통합 테스트**: 데코레이터와 라우팅 시스템 통합 테스트
- **E2E 테스트**: 실제 HTTP 요청/응답 시나리오 테스트
- **외부 의존성 최소화**: 순수 TypeScript로 테스트 도구 구현

### 프로젝트 구조 관리
```
src/
├── core/           # 서버 및 라우팅 핵심 로직
│   ├── router.ts
│   ├── router.test.ts
│   ├── server.ts
│   └── server.test.ts
├── decorators/     # 데코레이터 시스템
│   ├── index.ts
│   └── index.test.ts
├── types/          # 타입 정의
│   └── index.ts
└── utils/          # 함수형 유틸리티
    ├── functional.ts
    └── functional.test.ts

tests/
└── e2e/            # 순수 TS E2E 테스트
```

### 명령어 관리
- `pnpm dev`: 예제 앱 개발 모드 실행
- `pnpm build`: TypeScript 빌드
- `pnpm test`: Vitest 유닛 테스트 (watch)
- `pnpm test:unit`: 유닛 테스트 실행
- `pnpm test:e2e`: E2E 테스트 실행
- `pnpm test:all`: 모든 테스트 실행
- `pnpm lint`: oxlint 코드 검사
- `pnpm lint:fix`: oxlint 자동 수정
- `pnpm example:build`: 예제 앱 빌드 (example/build/ 디렉토리에 출력)
- `pnpm example:run`: 예제 앱 빌드 후 실행

### 개발 우선순위
1. **타입 안정성**: 모든 코드는 타입 체크 통과 필수
2. **테스트 커버리지**: 핵심 기능은 테스트 필수
3. **함수형 설계**: 부수 효과 없는 순수 함수 선호
4. **사용자 경험**: 직관적이고 간결한 API 설계
5. **성능**: 최소한의 런타임 오버헤드

### CI/CD 파이프라인
- **GitHub Actions**: 자동화된 테스트 및 빌드
- **다중 Node.js 버전**: 20, 22, 24 호환성 테스트
- **보안 스캔**: CodeQL을 통한 자동 보안 분석
- **의존성 관리**: Dependabot 자동 업데이트
- **릴리스 자동화**: 태그 기반 자동 릴리스

### Git 커밋 규칙
**중요**: 모든 커밋 메시지는 **Conventional Commits** 형식을 준수해야 합니다.

#### 커밋 메시지 형식
```
<type>(<scope>): <description>
```

- `<type>`: 변경 유형 (필수)
- `<scope>`: 변경 범위/워크스페이스 (선택사항)
- `<description>`: 변경 내용 설명 (필수)

#### 지원하는 타입 (changelogithub 연동)
- `feat`: 🚀 Features - 새로운 기능 추가
- `fix`: 🐞 Bug Fixes - 버그 수정
- `perf`: 🏎 Performance - 성능 개선
- `docs`: 📝 Documentation - 문서 변경
- `test`: ✅ Tests - 테스트 추가/수정
- `ci`: 🤖 CI - CI/CD 변경
- `style`: 🎨 Styles - 코드 스타일 변경
- `build`: 📦 Build - 빌드 시스템/의존성 변경
- `refactor`: 🔨 Code Refactoring - 기능 변경 없는 코드 리팩토링

#### 예시
- `feat: add interceptor system with decorator support`
- `feat(core): add server configuration options`
- `fix(example): prevent scattered build artifacts in example directory`
- `docs(api): update API documentation for controllers`
- `test(utils): add unit tests for functional utilities`
- `ci(github): update Node.js version to 24 in workflows`

### PR 및 머지 정책
- **Squash Merge Only**: 모든 PR은 squash merge로 병합
- **PR 제목 = 최종 커밋 메시지**: PR 제목이 conventional commit 형식이어야 함
- **Changelog 자동 생성**: changelogithub이 PR 제목을 기반으로 changelog 생성

### 미래 확장 계획
- 추가 HTTP 메서드 지원
- 고급 미들웨어 시스템
- 자동 API 문서 생성
- 플러그인 시스템
- 성능 최적화 도구

이 문서는 프로젝트 개발 과정에서 Claude의 역할과 책임을 명확히 하고, 일관된 개발 방향을 유지하기 위한 가이드입니다.
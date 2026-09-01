# PROGRESS

## 지금

서버에는 DB와 nginx까지 올렸고, 인터넷에서 접속도 된다.
백엔드를 서버에서 띄우다가 메모리가 부족해 멈춰 있다.

## 완료

- 로컬: MySQL(도커) + Spring Boot 4.1.1 + React(Vite/TS), `/api/ping` 화면 표시까지
- 서버: EC2 t3.micro 서울, 스왑 2GB, Docker, MySQL 기동
- nginx 설정 적용 — `http://52.78.101.16` 정상, `/api/` 프록시 연결됨
- JAR 전송(`~/app/wms-web.jar`), systemd 유닛 등록

## 막힌 것 — 서버 메모리 부족

### 증상

`systemctl start wms-web` 후 40초쯤 지나자 서버 전체가 응답을 멈춤.
`sudo systemctl status` 가 `Failed to get properties: Connection timed out` 을 뱉음.
SSH 새 접속도 붙지 않음. 콘솔에서 두 번 재부팅했지만 같은 상태로 돌아옴.

### 원인

**메모리를 넉넉하게 잡아서 1GB를 넘겼다.**

| 구성             | 설정          | 실제 사용                                         |
| ---------------- | ------------- | ------------------------------------------------- |
| OS + Docker 데몬 | —             | ~200MB                                            |
| MySQL 컨테이너   | 버퍼 풀 128MB | ~400MB (커넥션 버퍼·InnoDB 부가 구조 포함)        |
| JVM              | `-Xmx512m`    | 700MB+ (힙 외 메타스페이스·스레드 스택·코드 캐시) |

**설정값 = 실제 사용량이 아니다.** `-Xmx512m`은 힙 상한일 뿐이고, JVM은 그 바깥에도 메모리를 쓴다. 버퍼 풀도 마찬가지.

합치면 1GB를 훌쩍 넘겨서 스왑으로 밀려났다. **스왑은 죽지 않게 해주는 장치지 빠르게 해주는 장치가 아니다.** EBS 디스크를 메모리처럼 쓰니 수백 배 느려졌고, 결국 systemd와 통신하는 것조차 타임아웃 났다.

재부팅이 소용없던 이유는 `systemctl enable` 때문. **부팅할 때마다 앱이 자동으로 뜨면서 같은 상황을 반복**했다.

### 조치

```bash
ssh -i <키> ubuntu@<IP> "sudo systemctl disable --now wms-web"
```

대화형 접속은 느려서 실패했지만, **명령 하나만 실행하고 빠지는 방식**은 성공. 자동 시작이 끊기면서 서버가 정상으로 돌아옴.

설정도 줄임 (커밋 완료, **서버에는 아직 미적용**).

|               | 이전       | 이후       |
| ------------- | ---------- | ---------- |
| JVM 힙        | `-Xmx512m` | `-Xmx256m` |
| MySQL 버퍼 풀 | 128MB      | 64MB       |

예상 사용량: OS 200 + MySQL 250 + JVM 400 ≈ 850MB. 여유는 적지만 돌아갈 것.

### 다음에 확인할 것

- 기동 후 `free -h` 의 `Swap used` — 계속 크면 설정이 여전히 과하다는 뜻
- 그래도 안 되면 t3.small(2GB)로 올리는 걸 고려. 다만 크레딧이 두 배로 닳아 6개월 → 3개월

## 다음에 할 일

1. 서버에서 `git pull` → compose 재기동, systemd 유닛 다시 복사 후 `daemon-reload`
2. `systemctl start wms-web` → `curl localhost:8080/api/ping`
3. 브라우저에서 `http://<IP>/api/ping`
4. 프론트 `npm run build` → `dist/` scp → `/var/www/wms-web`
5. 도메인(DuckDNS) + HTTPS(certbot)

## 메모

- 인스턴스를 **중지**했다 켜면 퍼블릭 IP가 바뀐다 (재부팅은 유지)
- 성능 측정은 로컬 도커에서 한다. 서버(1GB)는 아직 측정에 쓰지 않고 더 좋은 서버에 올리면 고려한다.
- AWS 크레딧 $100, 월 $17쯤
- `sudo: unable to resolve host` 경고

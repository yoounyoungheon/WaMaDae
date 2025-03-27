import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MemberEntity } from '../member/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from '../dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginRequestDto } from '../dto/auth-login-request.dto';
import { AuthLogInResponseDto } from '../dto/auth-login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    try {
      const { username, password, name } = authCredentialsDto;
      const checkMember = await this.memberCheck(username);
      if (checkMember == true) {
        throw new BadRequestException({
          HttpStatus: HttpStatus.BAD_REQUEST,
          error:
            '[ERROR] 회원가입에 실해했습니다. 이미 존재하는 ID입니다. 다시 입력해주세요.',
          message: '이미 존재하는 회원입니다.',
          cause: 'Duplicated ID',
        });
      } else {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const memberEntity = this.memberRepository.create({
          username: username,
          name: name,
          password: hashedPassword,
        });
        await this.memberRepository.save(memberEntity);
        return '회원가입 성공';
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          HttpStatus: HttpStatus.BAD_REQUEST,
          error:
            '[ERROR] 회원가입에 실해했습니다. id, name, pw 형식이 올바른지 확인해주세요.',
          message: '서버에 오류가 발생했습니다. 잠시후 다시 시도해주세요.',
          cause: error,
        });
      }
    }
  }

  async signIn(
    authLoginDto: AuthLoginRequestDto,
  ): Promise<AuthLogInResponseDto> {
    const { username, password } = authLoginDto;
    const memberEntity = await this.memberRepository.findOneBy({ username });
    console.log(memberEntity);

    if (
      memberEntity &&
      (await bcrypt.compare(password, memberEntity.password))
    ) {
      const payload = { username };
      const accessToken = this.jwtService.sign(payload);
      const response = new AuthLogInResponseDto();
      response.accessToken = accessToken;
      response.memberId = memberEntity.memberId;
      response.name = memberEntity.name;
      response.username = memberEntity.username;
      return response;
    } else {
      throw new UnauthorizedException('login failed');
    }
  }

  async findById(memberId: string) {
    return await this.memberRepository.findOneBy({ memberId });
  }

  async memberCheck(username: string) {
    const member = await this.memberRepository.findOneBy({
      username: username,
    });
    if (member) {
      return true;
    } else {
      return false;
    }
  }
}

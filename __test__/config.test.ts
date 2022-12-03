
import { describe } from "riteway";
import { paths, serverConfig } from "../src/config";
import { pathResolve } from "../src/utils";






describe('config', async t => {

  // t({
  //   given: 'node env production',
  //   should: 'set web path to ../web_client',
  //   actual: paths('production').client,
  //   expected: pathResolve('../web_client'),
  // });

  // t({
  //   given: 'node env production',
  //   should: 'set mail.toEthan to his email',
  //   actual: serverConfig.mail.toEthan.includes('fake@test.yee'),
  //   expected: false,
  // });

  // t({
  //   given: 'node env production',
  //   should: 'set auth.red33m to red33m code',
  //   actual: serverConfig('production').auth.red33m == serverConfig('production').auth.testCode,
  //   expected: false,
  // });

  t({
    given: 'node env development',
    should: 'set mail.toEthan to fake email',
    actual: serverConfig.mail.toEthan,
    expected: 'fake@test.yee',
  });

  t({
    given: 'node env development',
    should: 'set auth.red33m to test code',
    actual: serverConfig.auth.red33m,
    expected: serverConfig.auth.testCode,
  });

  t({
    given: 'node env development',
    should: 'set web path to ../client/dist',
    actual: paths.client,
    expected: pathResolve('../client/dist'),
  });
});









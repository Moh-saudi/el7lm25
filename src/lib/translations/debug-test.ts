// Debug test for translation keys
import ar from './ar';

// Test navigation keys
console.log('Testing navigation keys:');
console.log('nav.careers:', ar.nav?.careers);
console.log('nav.support:', ar.nav?.support);

// Test footer keys
console.log('\nTesting footer keys:');
console.log('footer.company.title:', ar.footer?.company?.title);
console.log('footer.company.about:', ar.footer?.company?.about);
console.log('footer.company.careers:', ar.footer?.company?.careers);
console.log('footer.company.contact:', ar.footer?.company?.contact);
console.log('footer.company.support:', ar.footer?.company?.support);
console.log('footer.services.title:', ar.footer?.services?.title);
console.log('footer.services.players:', ar.footer?.services?.players);
console.log('footer.services.clubs:', ar.footer?.services?.clubs);
console.log('footer.services.academies:', ar.footer?.services?.academies);
console.log('footer.services.agents:', ar.footer?.services?.agents);
console.log('footer.legal.title:', ar.footer?.legal?.title);
console.log('footer.legal.privacy:', ar.footer?.legal?.privacy);
console.log('footer.legal.terms:', ar.footer?.legal?.terms);
console.log('footer.legal.cookies:', ar.footer?.legal?.cookies);
console.log('footer.contact.title:', ar.footer?.contact?.title);

// Test nested lookup function
function getNested(obj: any, dottedKey: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = dottedKey.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

console.log('\nTesting nested lookup:');
console.log('nav.careers lookup:', getNested(ar, 'nav.careers'));
console.log('nav.support lookup:', getNested(ar, 'nav.support'));
console.log('footer.company.title lookup:', getNested(ar, 'footer.company.title'));
console.log('footer.company.about lookup:', getNested(ar, 'footer.company.about'));
console.log('footer.services.players lookup:', getNested(ar, 'footer.services.players'));

export default ar;

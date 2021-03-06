import { FetchProtocol, Meta } from '../fetch-npm-module';
import { fetchWithRetries } from './utils';

type UnpkgMetaFiles = {
  path: string;
  type: 'file' | 'directory';
  files?: UnpkgMetaFiles[];
};

function normalize(files: UnpkgMetaFiles[], fileObject: Meta = {}) {
  for (let i = 0; i < files.length; i += 1) {
    if (files[i].type === 'file') {
      const absolutePath = files[i].path;
      fileObject[absolutePath] = true; // eslint-disable-line no-param-reassign
    }

    if (files[i].files) {
      normalize(files[i].files, fileObject);
    }
  }

  return fileObject;
}

export class CsbFetcher implements FetchProtocol {
  async file(name: string, version: string, path: string): Promise<string> {
    const url = `${version.replace(/\/_pkg.tgz$/, '')}${path}`;
    const result = await fetchWithRetries(url).then(x => x.text());

    return result;
  }

  async meta(name: string, version: string): Promise<Meta> {
    const url = `${version.replace(/\/\.pkg.tgz$/, '')}/_csb-meta.json`;
    const result: UnpkgMetaFiles = await fetchWithRetries(url).then(x =>
      x.json()
    );

    return normalize(result.files!, {});
  }
}

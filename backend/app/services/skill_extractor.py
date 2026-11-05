"""
Skill extraction from resume text using NLP and pattern matching.
Uses a comprehensive skill taxonomy for Indian tech job market.
"""
import re
from typing import List, Set
import logging

logger = logging.getLogger(__name__)

# Comprehensive skill taxonomy for Indian tech job market
PROGRAMMING_LANGUAGES = {
    'python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'go', 'golang',
    'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
    'dart', 'lua', 'haskell', 'elixir', 'clojure', 'objective-c', 'assembly',
    'bash', 'shell', 'powershell', 'sql', 'plsql', 'html', 'css', 'sass', 'less',
    'solidity', 'verilog', 'vhdl',
}

FRAMEWORKS_AND_LIBRARIES = {
    'react', 'angular', 'vue', 'svelte', 'nextjs', 'nuxt', 'gatsby',
    'express', 'fastapi', 'flask', 'django', 'spring', 'spring boot',
    'node.js', 'deno', 'bun', '.net', 'asp.net', 'rails', 'laravel',
    'flutter', 'react native', 'ionic', 'electron', 'tauri',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
    'opencv', 'spacy', 'nltk', 'hugging face', 'langchain',
    'tailwind', 'bootstrap', 'material ui', 'chakra ui', 'ant design',
    'jquery', 'three.js', 'd3.js', 'chart.js',
    'graphql', 'apollo', 'prisma', 'sequelize', 'mongoose', 'typeorm',
    'jest', 'mocha', 'pytest', 'junit', 'selenium', 'cypress', 'playwright',
    'redux', 'mobx', 'zustand', 'recoil', 'rxjs',
    'kafka', 'rabbitmq', 'celery', 'bull', 'bullmq',
    'socket.io', 'websocket',
}

DATABASES = {
    'mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'sql server',
    'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'couchdb',
    'neo4j', 'influxdb', 'firebase', 'supabase', 'cockroachdb',
    'mariadb', 'memcached', 'clickhouse',
}

DEVOPS_AND_CLOUD = {
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
    'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci',
    'terraform', 'ansible', 'puppet', 'chef', 'vagrant',
    'nginx', 'apache', 'caddy', 'traefik',
    'linux', 'ubuntu', 'centos', 'debian',
    'prometheus', 'grafana', 'datadog', 'new relic',
    'cloudflare', 'vercel', 'netlify', 'heroku', 'render', 'railway',
    'digitalocean', 'linode',
}

TOOLS_AND_PLATFORMS = {
    'git', 'github', 'gitlab', 'bitbucket', 'svn',
    'jira', 'confluence', 'trello', 'asana', 'notion',
    'figma', 'sketch', 'adobe xd', 'canva',
    'postman', 'insomnia', 'swagger',
    'vs code', 'intellij', 'eclipse', 'pycharm', 'vim',
    'slack', 'teams', 'zoom',
    'tableau', 'power bi', 'looker',
    'unity', 'unreal engine', 'blender',
    'wordpress', 'shopify', 'webflow',
}

CONCEPTS = {
    'rest api', 'graphql', 'microservices', 'monolith', 'serverless',
    'ci/cd', 'devops', 'agile', 'scrum', 'kanban',
    'tdd', 'bdd', 'unit testing', 'integration testing',
    'machine learning', 'deep learning', 'nlp', 'computer vision',
    'data science', 'data engineering', 'data analytics',
    'blockchain', 'web3', 'defi',
    'cybersecurity', 'penetration testing', 'ethical hacking',
    'cloud computing', 'distributed systems', 'system design',
    'object oriented programming', 'functional programming',
    'design patterns', 'solid principles',
    'data structures', 'algorithms',
}

ALL_SKILLS = (
    PROGRAMMING_LANGUAGES | FRAMEWORKS_AND_LIBRARIES | DATABASES |
    DEVOPS_AND_CLOUD | TOOLS_AND_PLATFORMS | CONCEPTS
)


def extract_skills_from_text(text: str) -> dict:
    """
    Extract categorized skills from resume text.

    Returns:
        Dictionary with keys: skills, programming_languages, frameworks, databases
    """
    text_lower = text.lower()

    found_languages = _match_skills(text_lower, PROGRAMMING_LANGUAGES)
    found_frameworks = _match_skills(text_lower, FRAMEWORKS_AND_LIBRARIES)
    found_databases = _match_skills(text_lower, DATABASES)
    found_devops = _match_skills(text_lower, DEVOPS_AND_CLOUD)
    found_tools = _match_skills(text_lower, TOOLS_AND_PLATFORMS)
    found_concepts = _match_skills(text_lower, CONCEPTS)

    # Combine all unique skills
    all_found = (
        found_languages | found_frameworks | found_databases |
        found_devops | found_tools | found_concepts
    )

    return {
        'skills': sorted(list(all_found)),
        'programming_languages': sorted(list(found_languages)),
        'frameworks': sorted(list(found_frameworks)),
        'databases': sorted(list(found_databases)),
    }


def _match_skills(text: str, skill_set: Set[str]) -> Set[str]:
    """Match skills from a skill set against text using word boundary matching."""
    found = set()
    for skill in skill_set:
        # Escape special regex chars in skill name
        escaped = re.escape(skill)
        # Use word boundary matching
        pattern = r'(?:^|[\s,;|•\-\(\)/])' + escaped + r'(?:[\s,;|•\-\(\)/]|$)'
        if re.search(pattern, text):
            found.add(skill)
    return found
